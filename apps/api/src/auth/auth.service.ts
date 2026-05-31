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
  TelegramLoginDto,
  TelegramRegisterDto,
} from './dto';
import { EmailService } from './email.service';
import { randomBytes, createHmac } from 'crypto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

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
    private readonly auditLogsService: AuditLogsService,
  ) {}

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
    const response = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role.roleName,
      permissions: user.role.permissions.map((rp: any) => rp.permission.name),
      isEmailVerified: user.isEmailVerified,
      isCampusIdVerified: user.isCampusIdVerified,
      studentId: user.studentId,
      academicProgram: user.academicProgram,
      profileImage: user.profileImage,
      phone: user.phone,
    };
    console.log('[AuthService] Built user response:', response);
    return response;
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

      const userBefore = await this.prisma.user.findUnique({ where: { id: token.userId } });
      const [userAfter] = await this.prisma.$transaction([
        this.prisma.user.update({
          where: { id: token.userId },
          data: { isEmailVerified: true, emailVerifiedAt: new Date() },
        }),

        this.prisma.oneTimeToken.update({
          where: { id: token.id },
          data: { usedAt: new Date() },
        }),
      ]);

      // Audit Log
      try {
        await this.auditLogsService.createLog({
          userId: token.userId,
          action: 'EMAIL_VERIFICATION',
          entityType: 'USER',
          entityId: token.userId,
          outcome: 'SUCCESS',
          details: `User verified email: ${userBefore?.email}`,
          beforeState: userBefore,
          afterState: userAfter,
        });
      } catch (e) {
        console.error(`Failed to create audit log: ${e.message}`);
      }

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

      const userBefore = await this.prisma.user.findUnique({ where: { id: token.userId } });
      const [userAfter] = await this.prisma.$transaction([
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

      // Audit Log
      try {
        await this.auditLogsService.createLog({
          userId: token.userId,
          action: 'PASSWORD_RESET',
          entityType: 'USER',
          entityId: token.userId,
          outcome: 'SUCCESS',
          details: `User reset password for email: ${userBefore?.email}`,
          beforeState: userBefore,
          afterState: userAfter,
        });
      } catch (e) {
        console.error(`Failed to create audit log: ${e.message}`);
      }

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

      const updated = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          studentId: parsed.studentId,
          academicProgram: parsed.academicProgram,
          isCampusIdVerified: true,
          campusIdVerifiedAt: new Date(),
        },
      });

      // Audit Log
      try {
        await this.auditLogsService.createLog({
          userId: user.id,
          action: 'CAMPUS_ID_VERIFICATION',
          entityType: 'USER',
          entityId: user.id,
          outcome: 'SUCCESS',
          details: `User verified campus ID: ${parsed.studentId}`,
          beforeState: user,
          afterState: updated,
        });
      } catch (e) {
        console.error(`Failed to create audit log: ${e.message}`);
      }

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
    const email = dto.email.toLowerCase().trim();
    try {
      const exists = await this.prisma.user.findUnique({
        where: { email },
      });

      if (exists) {
        throw new BadRequestException('Email already in use');
      }

      const role = await this.prisma.role.findFirst({
        where: { roleName: { equals: dto.roleName ?? 'Student', mode: 'insensitive' } },
      });

      if (!role) throw new BadRequestException('Role not found');

      const passwordHash = await argon.hash(dto.password);

      // Ensure departmentId is a valid UUID or null (empty strings cause Prisma errors)
      const sanitizedDepartmentId =
        dto.departmentId && dto.departmentId.trim() !== '' ? dto.departmentId : null;

      const user = await this.prisma.user.create({
        data: {
          fullName: dto.fullName,
          email,
          passwordHash,
          phone: dto.phone,
          roleId: role.id,
          departmentId: sanitizedDepartmentId,
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

      try {
        await this.auditLogsService.createLog({
          userId: user.id,
          action: 'SIGNUP',
          entityType: 'USER',
          outcome: 'SUCCESS',
          details: `New user signed up: ${user.email}`,
          ipAddress: meta?.ip,
          userAgent: meta?.userAgent,
          role: user.role.roleName,
          afterState: {
            email: user.email,
            fullName: user.fullName,
            role: user.role.roleName,
          },
        });
      } catch (logError) {
        console.error('Non-critical error: Audit log creation failed during signup:', logError);
      }

      return {
        user: this.buildUserResponse(user),
        ...tokens,
        message: verificationEmailSent
          ? 'Signup successful. Please verify your email to complete registration.'
          : 'Signup successful, but we could not send the verification email right now. Please try again later.',
      };
    } catch (err) {
      console.error('AuthService.signUp failed:', {
        email: dto.email,
        error: err instanceof Error ? err.message : err,
        code: err.code,
        stack: err instanceof Error ? err.stack : undefined,
      });

      if (err.code === 'P2002') {
        throw new BadRequestException('Email already in use');
      }

      if (err.code === 'P2003') {
        throw new BadRequestException('Invalid department or role selection');
      }

      if (err.code === 'P2007') {
        throw new BadRequestException('Invalid data format provided');
      }

      throw err;
    }
  }

  async login(dto: LoginDto, meta?: { ip?: string; userAgent?: string }) {
    const email = dto.email.toLowerCase().trim();
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        include: {
          role: { include: { permissions: { include: { permission: true } } } },
        },
      });

      if (!user) {
        // Cannot log: no valid userId (FK constraint). Just reject.
        throw new UnauthorizedException('Invalid credentials');
      }

      if (!user.passwordHash) {
        throw new UnauthorizedException('Please log in via Telegram or set a password.');
      }

      const pwMatches = await argon.verify(user.passwordHash, dto.password);
      if (!pwMatches) {
        await this.auditLogsService.createLog({
          userId: user.id,
          action: 'LOGIN',
          entityType: 'USER',
          outcome: 'FAILURE',
          details: `Failed login attempt for email: ${email} (Invalid password)`,
          ipAddress: meta?.ip,
          userAgent: meta?.userAgent,
          role: user.role.roleName,
        });
        throw new UnauthorizedException('Invalid credentials');
      }

      if (!user.isEmailVerified) {
        throw new UnauthorizedException('Please verify your email first');
      }

      const tokens = await this.createSessionAndTokens(user.id, user.email, meta);

      await this.auditLogsService.createLog({
        userId: user.id,
        action: 'LOGIN',
        entityType: 'USER',
        outcome: 'SUCCESS',
        details: `User logged in successfully: ${email}`,
        ipAddress: meta?.ip,
        userAgent: meta?.userAgent,
        role: user.role.roleName,
      });

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
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error(`[AuthService.refreshToken] Failure: ${message}`, {
        tokenSnippet: dto.refreshToken.substring(0, 10) + '...',
        error: err,
      });
      throw err;
    }
  }

  verifyTelegramInitData(initData: string): {
    telegramId: string;
    username?: string;
    firstName?: string;
    lastName?: string;
  } {
    const botToken = this.config.get<string>('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      throw new BadRequestException('Telegram integration is not configured (missing bot token)');
    }

    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) {
      throw new BadRequestException('Invalid initData: missing hash');
    }

    params.delete('hash');
    const sortedKeys = Array.from(params.keys()).sort();
    const dataCheckString = sortedKeys.map((key) => `${key}=${params.get(key)}`).join('\n');

    const secretKey = createHmac('sha256', 'WebappData').update(botToken).digest();

    const computedHash = createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    if (computedHash !== hash) {
      throw new UnauthorizedException('Invalid Telegram authentication signature');
    }

    const rawUser = params.get('user');
    if (!rawUser) {
      throw new BadRequestException('Invalid initData: missing user object');
    }

    try {
      const parsedUser = JSON.parse(rawUser);
      if (!parsedUser.id) {
        throw new BadRequestException('Invalid user object: missing id');
      }

      return {
        telegramId: String(parsedUser.id),
        username: parsedUser.username,
        firstName: parsedUser.first_name,
        lastName: parsedUser.last_name,
      };
    } catch {
      throw new BadRequestException('Failed to parse Telegram user data');
    }
  }

  async telegramLogin(dto: TelegramLoginDto, meta?: { ip?: string; userAgent?: string }) {
    const tgUser = this.verifyTelegramInitData(dto.initData);

    const user = await this.prisma.user.findUnique({
      where: { telegramId: tgUser.telegramId },
      include: {
        role: { include: { permissions: { include: { permission: true } } } },
      },
    });

    if (!user) {
      return {
        onboardingRequired: true,
        telegramUser: tgUser,
      };
    }

    const tokens = await this.createSessionAndTokens(user.id, user.email, meta);

    try {
      await this.auditLogsService.createLog({
        userId: user.id,
        action: 'TELEGRAM_LOGIN',
        entityType: 'USER',
        outcome: 'SUCCESS',
        details: `User logged in via Telegram: ${user.email}`,
        ipAddress: meta?.ip,
        userAgent: meta?.userAgent,
        role: user.role.roleName,
      });
    } catch (logError) {
      console.error('Audit log failed during telegram login:', logError);
    }

    return {
      onboardingRequired: false,
      user: this.buildUserResponse(user),
      ...tokens,
    };
  }

  async telegramRegister(dto: TelegramRegisterDto, meta?: { ip?: string; userAgent?: string }) {
    const tgUser = this.verifyTelegramInitData(dto.initData);
    const email = dto.email.toLowerCase().trim();

    const existingTg = await this.prisma.user.findUnique({
      where: { telegramId: tgUser.telegramId },
      include: {
        role: { include: { permissions: { include: { permission: true } } } },
      },
    });
    if (existingTg) {
      const tokens = await this.createSessionAndTokens(existingTg.id, existingTg.email, meta);
      return {
        user: this.buildUserResponse(existingTg),
        ...tokens,
      };
    }

    const existingEmail = await this.prisma.user.findUnique({
      where: { email },
      include: {
        role: { include: { permissions: { include: { permission: true } } } },
      },
    });

    let user;
    if (existingEmail) {
      if (existingEmail.telegramId) {
        throw new BadRequestException('This email is already linked to another Telegram account');
      }

      user = await this.prisma.user.update({
        where: { id: existingEmail.id },
        data: { telegramId: tgUser.telegramId },
        include: {
          role: { include: { permissions: { include: { permission: true } } } },
        },
      });
    } else {
      const role = await this.prisma.role.findFirst({
        where: { roleName: { equals: 'STUDENT', mode: 'insensitive' } },
      });
      if (!role) throw new BadRequestException('Student role not found');

      const sanitizedDepartmentId =
        dto.departmentId && dto.departmentId.trim() !== '' ? dto.departmentId : null;

      user = await this.prisma.user.create({
        data: {
          fullName: dto.fullName,
          email,
          roleId: role.id,
          departmentId: sanitizedDepartmentId,
          telegramId: tgUser.telegramId,
        },
        include: {
          role: { include: { permissions: { include: { permission: true } } } },
        },
      });

      const verificationEmailSent = await this.issueEmailVerificationToken(user.id, user.email);
      if (verificationEmailSent) {
        console.log('Telegram signup email verification issued for:', user.email);
      }
    }

    const tokens = await this.createSessionAndTokens(user.id, user.email, meta);

    try {
      await this.auditLogsService.createLog({
        userId: user.id,
        action: 'TELEGRAM_SIGNUP',
        entityType: 'USER',
        outcome: 'SUCCESS',
        details: `User signed up/linked via Telegram: ${user.email}`,
        ipAddress: meta?.ip,
        userAgent: meta?.userAgent,
        role: user.role.roleName,
      });
    } catch (logError) {
      console.error('Audit log failed during telegram registration:', logError);
    }

    return {
      user: this.buildUserResponse(user),
      ...tokens,
    };
  }
}
