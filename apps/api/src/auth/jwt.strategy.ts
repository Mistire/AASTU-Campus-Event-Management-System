import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';

type JwtPayload = {
  sub: string;
  email: string;
  sid: string;
};

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  permissions: string[];
  sessionId: string;
  isEmailVerified: boolean;
  isCampusIdVerified: boolean;
  profileImage: string | null;
  phone: string | null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    const jwtSecret = config.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in configuration');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    if (!payload?.sub || !payload?.sid) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const [user, session] = await Promise.all([
      this.prisma.user.findUnique({
        where: {
          id: payload.sub,
        },
        include: {
          role: {
            include: {
              permissions: { include: { permission: true } },
            },
          },
        },
      }),

      this.prisma.authSession.findUnique({
        where: { id: payload.sid },
      }),
    ]);
    if (!user) {
      throw new UnauthorizedException('Invalid token user');
    }

    if (!user.role) {
      throw new UnauthorizedException('User role not found');
    }

    if (
      !session ||
      session.userId !== user.id ||
      session.isRevoked ||
      session.expiresAt <= new Date()
    ) {
      throw new UnauthorizedException('Session expired or revoked');
    }

    const permissions = (user.role.permissions ?? [])
      .map((rp) => rp.permission?.name)
      .filter((name): name is string => Boolean(name));

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role.roleName,
      permissions,
      sessionId: session.id,
      isEmailVerified: user.isEmailVerified,
      isCampusIdVerified: user.isCampusIdVerified,
      profileImage: user.profileImage,
      phone: user.phone,
    };
  }
}
