/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Body, Controller, Get, Headers, Ip, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ForgotPasswordDto,
  LoginDto,
  RefereshTokenDto,
  ResetPasswordDto,
  SignUpDto,
  VerifyEmailDto,
} from './dto';
import { Public } from './decorator';
import { JwtAuthGuard } from './guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }
  @Public()
  @Post('signup')
  signup(@Body() dto: SignUpDto, @Ip() ip: string, @Headers('user-agent') userAgent?: string) {
    if (userAgent) {
      console.log('User Agent:', userAgent);
    } else {
      console.log('User Agent header is missing');
    }
    return this.authService.signUp(dto, { ip, userAgent });
  }
  @Public()
  @Post('login')
  login(@Body() dto: LoginDto, @Ip() ip: string, @Headers('user-agent') userAgent?: string) {
    if (userAgent) {
      console.log('User Agent:', userAgent);
    } else {
      console.log('User Agent header is missing');
    }
    return this.authService.login(dto, { ip, userAgent });
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
  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
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
  me(@Req() req: any) {
    return req.user;
  }
}
