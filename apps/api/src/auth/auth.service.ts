import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { LoginDto, SignUpDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async signUp(dto: SignUpDto) {
    try {
      const exists = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (exists) {
        throw new BadRequestException('Email already in use');
      }

      const role = await this.prisma.role.findFirst({
        where: { roleName: dto.roleName ?? 'STUDENT' },
      });

      if (!role) throw new BadRequestException('Role not found');

      const passwordHash = await argon.hash(dto.password);
      const user = await this.prisma.user.create({
        data: {
          fullName: dto.fullName,
          email: dto.email,
          passwordHash,
          roleId: role.id,
        },
        include: {
          role: {
            include: { permissions: { include: { permission: true } } },
          },
        },
      });

      const token = await this.signToken(user.id, user.email);
      return {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role.roleName,
          permissions: user.role.permissions.map((rp) => rp.permission.name),
        },
        ...token,
      };
    } catch (err) {
      console.error('AuthService.signUp error:', err);
      throw err;
    }
  }

  async login(dto: LoginDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
        include: {
          role: { include: { permissions: { include: { permission: true } } } },
        },
      });

      if (!user) throw new UnauthorizedException('Invalid credentials');
      const pwMatches = await argon.verify(user.passwordHash, dto.password);
      if (!pwMatches) throw new UnauthorizedException('Invalid credentials');

      const token = await this.signToken(user.id, user.email);
      return {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role.roleName,
          permissions: user.role.permissions.map((rp) => rp.permission.name),
        },
        ...token,
      };
    } catch (err) {
      console.error('AuthService.login error:', err);
      throw err;
    }
  }

  async signToken(userId: string, email: string): Promise<{ access_token: string }> {
    try {
      const payload = {
        sub: userId,
        email,
      };

      const accessToken = await this.jwt.signAsync(payload, {
        secret: this.config.get<string>('JWT_SECRET'),
        expiresIn: this.config.get('JWT_EXPIRATION') || '15m',
      });

      return {
        access_token: accessToken,
      };
    } catch (err) {
      console.error('AuthService.signToken error:', err);
      throw err;
    }
  }
}
