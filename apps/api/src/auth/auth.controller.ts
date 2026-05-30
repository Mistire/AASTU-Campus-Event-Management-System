/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Ip,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
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
import { Public } from './decorator';
import { JwtAuthGuard } from './guard';
import { ApiTags } from '@nestjs/swagger';
import { AuthUser } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';

import { Throttle } from '@nestjs/throttler';

type AuthenticatedRequest = Request & { user?: AuthUser };

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}
  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('signup')
  signup(@Body() dto: SignUpDto, @Ip() ip: string, @Headers('user-agent') userAgent?: string) {
    return this.authService.signUp(dto, { ip, userAgent });
  }
  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('login')
  login(@Body() dto: LoginDto, @Ip() ip: string, @Headers('user-agent') userAgent?: string) {
    return this.authService.login(dto, { ip, userAgent });
  }

  @Public()
  @Post('telegram/login')
  telegramLogin(
    @Body() dto: TelegramLoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent?: string,
  ) {
    return this.authService.telegramLogin(dto, { ip, userAgent });
  }

  @Public()
  @Post('telegram/register')
  telegramRegister(
    @Body() dto: TelegramRegisterDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent?: string,
  ) {
    return this.authService.telegramRegister(dto, { ip, userAgent });
  }
  @Public()
  @Post('refresh')
  refresh(@Body() dto: RefereshTokenDto) {
    return this.authService.refreshToken(dto);
  }

  @Public()
  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Get('reset-password')
  resetPasswordLink(@Query('token') token?: string) {
    if (!token) {
      throw new BadRequestException('Missing reset token');
    }

    const frontendBaseUrl = this.configService.get<string>('FRONTEND_URL');
    if (frontendBaseUrl) {
      return {
        message: 'Open this URL in your browser to set a new password.',
        redirectTo: `${frontendBaseUrl}/auth/reset-password?token=${encodeURIComponent(token)}`,
      };
    }

    return {
      message:
        'Use POST /api/auth/reset-password with JSON body: { "token": "...", "newPassword": "..." }',
      token,
    };
  }

  @Public()
  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-campus-id')
  verifyCampusId(@Req() req: AuthenticatedRequest, @Body() dto: VerifyCampusIdDto) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    return this.authService.verifyCampusId(user.id, dto);
  }

  @Public()
  @Get('verify-email')
  verifyEmail(@Query() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Req() req: any) {
    return this.authService.logout(req.user.id, req.user.sessionId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  logoutAll(@Req() req: any) {
    return this.authService.logoutAll(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('verify-session')
  verifySession(@Req() req: any) {
    return this.authService.verifySessions(req.user.id, req.user.sessionId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      permissions: user.permissions,
      sessionId: user.sessionId,
      isEmailVerified: user.isEmailVerified,
      isCampusIdVerified: user.isCampusIdVerified,
      profileImage: user.profileImage,
      phone: user.phone,
    };
  }
}
