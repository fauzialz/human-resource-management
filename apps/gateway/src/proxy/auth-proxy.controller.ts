import { Controller, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { Public } from '../decorators/public.decorator';
import { ProxyService } from './proxy.service';

@Controller('auth')
export class AuthProxyController {
  constructor(private readonly proxy: ProxyService) {}

  @Public()
  @Post('login')
  async login(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxy.forward(
      req,
      res,
      'EMPLOYEE_SERVICE_URL',
      '/api/auth/login',
    );
  }
}
