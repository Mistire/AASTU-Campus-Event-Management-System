/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import {
  ForgotPasswordDto,
  LoginDto,
  RefereshTokenDto,
  ResetPasswordDto,
  SignUpDto,
  VerifyCampusIdDto,
  VerifyEmailDto,
} from './dto';
import { EmailService } from './email.service';
import { randomBytes } from 'crypto';

type JwtPayload = {
  sub: string;
  email: string;
  sid: string;
};

type ParsedCampusQr = {
  fullName: string;
  studentId: string;
  academicProgram: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly emailService: EmailService,
  ) { }

  private async issueEmailVerificationToken(userId: string, email: string): Promise<boolean> {
    const rawToken = randomBytes(32).toString('hex');
    const hash = await argon.hash(rawToken);

    const ttlMinutes = Number(this.config.get('EMAIL_VERIFICATION_TOKEN_TTL') ?? 60);

    await this.prisma.oneTimeToken.create({
      data: {
        userId,
        tokenHash: hash,
        type: 'EMAIL_VERIFICATION',
        expiresAt: new Date(Date.now() + ttlMinutes * 60 * 1000),
      },
    });

    try {
      await this.emailService.sendVerificationEmail(email, rawToken);
      return true;
    } catch (err) {
      console.error('AuthService.issueEmailVerificationToken email send failed:', err);
      return false;
    }
  }
  private async issuePasswordResetToken(userId: string, email: string) {
    const rawToken = randomBytes(32).toString('hex');
    const hash = await argon.hash(rawToken);

    const ttlMinutes = Number(this.config.get<string>('RESET_TOKEN_TTL_MINUTES') ?? 30);

    await this.prisma.oneTimeToken.create({
      data: {
        userId,
        tokenHash: hash,
        type: 'PASSWORD_RESET',
        expiresAt: new Date(Date.now() + ttlMinutes * 60 * 1000),
      },
    });

    await this.emailService.sendPasswordResetEmail(email, rawToken);
  }
  private refreshExpiryDate() {
    const days = 7;
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }

  private buildUserResponse(user: any) {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role.roleName,
      permissions: user.role.permissions.map((rp: any) => rp.permission.name),
      isEmailVerified: user.isEmailVerified,
      isCampusIdVerified: user.isCampusIdVerified,
      studentId: user.studentId,
      academicProgram: user.academicProgram,
    };
  }

  private normalizeFullName(value: string) {
    return value.replace(/\s+/g, ' ').trim().toLocaleLowerCase();
  }

  private parseCampusQrPayload(rawPayload: string): ParsedCampusQr {
    const payload = rawPayload.trim();
    const pattern = /^(.*?)\s*\(([^)]+)\)\s*-\s*(.+)$/;
    const match = payload.match(pattern);

    if (!match) {
      throw new BadRequestException(
        'Invalid campus QR payload format. Expected: FULL NAME (STUDENT_ID) - PROGRAM',
      );
    }

    const fullName = match[1]?.trim();
    const studentId = match[2]?.trim();
    const academicProgram = match[3]?.trim();

    console.log('Parsed campus QR payload:', { fullName, studentId, academicProgram });

    if (!fullName || !studentId || !academicProgram) {
      throw new BadRequestException('Campus QR payload is missing required values');
    }

    return { fullName, studentId, academicProgram };
  }

  private async consumeOneTimeToken(
    type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET',
    rawToken: string,
  ) {
    const candidates = await this.prisma.oneTimeToken.findMany({
      where: {
        type,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    for (const candidate of candidates) {
      const matched = await argon.verify(candidate.tokenHash, rawToken);
      if (matched) return candidate;
    }
  }

  private async signAccessToken(userId: string, email: string, sid: string) {
    const payload: JwtPayload = { sub: userId, email, sid };

    return await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('JWT_SECRET'),
      expiresIn: this.config.get('JWT_EXPIRATION') ?? '15m',
    });
  }

  private async signRefreshToken(userId: string, email: string, sid: string) {
    const payload: JwtPayload = { sub: userId, email, sid };

    return this.jwt.signAsync(payload, {
      secret:
        this.config.get<string>('JWT_REFRESH_SECRET') ?? this.config.get<string>('JWT_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRATION') ?? '7d',
    });
  }

  private async verifyRefreshToken(token: string): Promise<JwtPayload> {
    try {
      return await this.jwt.verifyAsync<JwtPayload>(token, {
        secret:
          this.config.get<string>('JWT_REFRESH_SECRET') ?? this.config.get<string>('JWT_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async createSessionAndTokens(
    userId: string,
    email: string,
    meta?: { ip?: string; userAgent?: string },
  ) {
    const session = await this.prisma.authSession.create({
      data: {
        userId,
        refreshTokenHash: 'PENDING_HASH',
        userAgent: meta?.userAgent,
        ipAddress: meta?.ip,
        expiresAt: this.refreshExpiryDate(),
      },
    });

    const accessToken = await this.signAccessToken(userId, email, session.id);
    const refreshToken = await this.signRefreshToken(userId, email, session.id);

    await this.prisma.authSession.update({
      where: { id: session.id },
      data: {
        refreshTokenHash: await argon.hash(refreshToken),
      },
    });

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async verifySessions(userId: string, sessionId: string) {
    try {
      const session = await this.prisma.authSession.findFirst({
        where: {
          id: sessionId,
          userId,
          isRevoked: false,
          expiresAt: { gt: new Date() },
        },
      });

      return { valid: !!session };
    } catch (err) {
      console.error('AuthService.verifySessions error:', err);
      throw err;
    }
  }

  async verifyEmail(dto: VerifyEmailDto) {
    try {
      const token = await this.consumeOneTimeToken('EMAIL_VERIFICATION', dto.token);
      if (!token) throw new BadRequestException('Invalid or expired token');

      await this.prisma.$transaction([
        this.prisma.user.update({
          where: { id: token.userId },
          data: { isEmailVerified: true, emailVerifiedAt: new Date() },
        }),

        this.prisma.oneTimeToken.update({
          where: { id: token.id },
          data: { usedAt: new Date() },
        }),
      ]);

      return { message: 'Email verified successfully' };
    } catch (err) {
      console.error('AuthService.verifyEmail error:', err);
      throw err;
    }
  }

  async resetPassword(dto: ResetPasswordDto) {
    try {
      const token = await this.consumeOneTimeToken('PASSWORD_RESET', dto.token);
      if (!token) throw new BadRequestException('Invalid or expired token');

      const newHash = await argon.hash(dto.newPassword);

      await this.prisma.$transaction([
        this.prisma.user.update({
          where: { id: token.userId },
          data: {
            passwordHash: newHash,
            passwordChangedAt: new Date(),
          },
        }),

        this.prisma.oneTimeToken.update({
          where: { id: token.id },
          data: { usedAt: new Date() },
        }),

        this.prisma.authSession.updateMany({
          where: { userId: token.userId, isRevoked: false },
          data: {
            isRevoked: true,
            revokedAt: new Date(),
          },
        }),
      ]);

      return { message: 'Password reset successfully. Please log in with your new password.' };
    } catch (err) {
      console.error('AuthService.resetPassword error:', err);
      throw err;
    }
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    try {
      const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (!user) {
        return {
          message: 'If an account with that email exists, a password reset link has been sent.',
        };
      }

      try {
        await this.issuePasswordResetToken(user.id, user.email);
      } catch (err) {
        console.error('AuthService.forgotPassword email send failed:', err);
      }

      return {
        message: 'If an account with that email exists, a password reset link has been sent.',
      };
    } catch (err) {
      console.error('AuthService.forgotPassword error:', err);
      throw err;
    }
  }

  async logoutAll(userId: string) {
    try {
      await this.prisma.authSession.updateMany({
        where: { userId, isRevoked: false },
        data: { isRevoked: true, revokedAt: new Date() },
      });
    } catch (err) {
      console.error('AuthService.logoutAll error:', err);
      throw err;
    }
  }

  async logout(userId: string, sessionId: string) {
    try {
      await this.prisma.authSession.updateMany({
        where: {
          id: sessionId,
          userId,
          isRevoked: false,
        },

        data: {
          isRevoked: true,
          revokedAt: new Date(),
        },
      });
    } catch (err) {
      console.error('AuthService.logout error:', err);
      throw err;
    }

    return { message: 'Logged out successfully' };
  }

  async verifyCampusId(userId: string, dto: VerifyCampusIdDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const parsed = this.parseCampusQrPayload(dto.qrPayload);

      if (this.normalizeFullName(parsed.fullName) !== this.normalizeFullName(user.fullName)) {
        throw new BadRequestException('Campus QR full name does not match your signup full name');
      }

      const existingStudent = await this.prisma.user.findFirst({
        where: {
          studentId: parsed.studentId,
          id: { not: user.id },
        },
      });

      if (existingStudent) {
        throw new BadRequestException('This campus ID is already linked to another account');
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          studentId: parsed.studentId,
          academicProgram: parsed.academicProgram,
          isCampusIdVerified: true,
          campusIdVerifiedAt: new Date(),
        },
      });

      return {
        message: 'Campus ID verified successfully',
        studentId: parsed.studentId,
        academicProgram: parsed.academicProgram,
      };
    } catch (err) {
      console.error('AuthService.verifyCampusId error:', err);
      throw err;
    }
  }

  async signUp(dto: SignUpDto, meta?: { ip?: string; userAgent?: string }) {
    try {
      const exists = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (exists) {
        throw new BadRequestException('Email already in use');
      }

      const role = await this.prisma.role.findFirst({
        where: { roleName: dto.roleName ?? 'Student' },
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

      console.log('New user created:', user.email);

      const verificationEmailSent = await this.issueEmailVerificationToken(user.id, user.email);

      if (verificationEmailSent) {
        console.log('Email verification token issued for:', user.email);
      } else {
        console.warn('Signup completed but verification email could not be sent:', user.email);
      }

      const tokens = await this.createSessionAndTokens(user.id, user.email, meta);

      console.log('Session and tokens created for:', user.email);
      return {
        user: this.buildUserResponse(user),
        ...tokens,
        message: verificationEmailSent
          ? 'Signup successful. Please verify your email and campus ID QR to complete registration.'
          : 'Signup successful, but we could not send the verification email right now. Please try again later, then complete campus ID QR verification.',
      };
    } catch (err) {
      console.error('AuthService.signUp error:', err);
      throw err;
    }
  }

  async login(dto: LoginDto, meta?: { ip?: string; userAgent?: string }) {
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

      if (!user.isEmailVerified) {
        throw new UnauthorizedException('Please verify your email first');
      }

      if (user.role.roleName === 'Student' && !user.isCampusIdVerified) {
        throw new UnauthorizedException('Please verify your campus ID QR first');
      }

      const tokens = await this.createSessionAndTokens(user.id, user.email, meta);
      return {
        user: this.buildUserResponse(user),
        ...tokens,
      };
    } catch (err) {
      console.error('AuthService.login error:', err);
      throw err;
    }
  }

  async refreshToken(dto: RefereshTokenDto) {
    try {
      const payload = await this.verifyRefreshToken(dto.refreshToken);

      const session = await this.prisma.authSession.findUnique({
        where: { id: payload.sid },
        include: { user: true },
      });

      if (!session || session.isRevoked) {
        throw new UnauthorizedException('Session is no longer active');
      }

      if (session.expiresAt <= new Date()) {
        throw new UnauthorizedException('Refresh token expired');
      }

      const validHash = await argon.verify(session.refreshTokenHash, dto.refreshToken);
      if (!validHash) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const accessToken = await this.signAccessToken(
        session.userId,
        session.user.email,
        session.id,
      );
      const refreshToken = await this.signRefreshToken(
        session.userId,
        session.user.email,
        session.id,
      );

      await this.prisma.authSession.update({
        where: { id: session.id },
        data: {
          refreshTokenHash: await argon.hash(refreshToken),
          expiresAt: this.refreshExpiryDate(),
        },
      });

      return { access_token: accessToken, refresh_token: refreshToken };
    } catch (err) {
      console.error('AuthService.refreshToken error:', err);
      throw err;
    }
  }
}
