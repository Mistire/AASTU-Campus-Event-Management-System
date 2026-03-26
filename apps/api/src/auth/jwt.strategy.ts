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
    try {
      console.log('[JwtStrategy] Payload sub:', payload.sub, 'sid:', payload.sid);
      const [user, session] = await Promise.all([
        this.prisma.user.findUnique({
          where: { id: payload.sub },
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

      console.log('[JwtStrategy] User found:', !!user, 'Session found:', !!session);
      if (user) console.log('[JwtStrategy] User Role:', user.role?.roleName);
      if (session) console.log('[JwtStrategy] Session matches User:', session.userId === user?.id, 'Is Revoked:', session.isRevoked, 'Expired:', session.expiresAt <= new Date());

      if (!user) {
        throw new UnauthorizedException('Invalid token user');
      }

      if (
        !session ||
        session.userId !== user.id ||
        session.isRevoked ||
        session.expiresAt <= new Date()
      ) {
        throw new UnauthorizedException('Session expired or revoked');
      }

      return {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role?.roleName || '',
        permissions: user.role?.permissions?.map((rp) => rp.permission?.name).filter(Boolean) as string[] || [],
        sessionId: session.id,
        isEmailVerified: user.isEmailVerified,
      };
    } catch (err) {
      // Re-throw HttpExceptions (like UnauthorizedException) as-is
      if (err instanceof UnauthorizedException) throw err;
      // Log any unexpected errors with full stack trace
      console.error('[JwtStrategy] Unexpected error in validate():', err);
      throw new UnauthorizedException('Authentication failed due to a server error');
    }
  }
}
