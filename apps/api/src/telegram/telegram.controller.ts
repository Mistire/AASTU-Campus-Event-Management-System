import { Controller, Post, Req, Res } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import type { Request, Response } from 'express';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Telegram')
@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  /**
   * Telegram webhook endpoint — called by Telegram's servers in production.
   * In development this is unused (bot uses polling instead).
   */
  @Post('webhook')
  async handleWebhook(@Req() req: Request, @Res() res: Response) {
    await this.telegramService.handleWebhookUpdate(req.body);
    res.sendStatus(200);
  }
}
