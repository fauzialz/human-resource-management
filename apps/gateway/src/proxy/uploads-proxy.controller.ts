import { Controller, Get, Req, Res } from '@nestjs/common';
import { Public } from '../decorators/public.decorator';
import { ProxyService } from './proxy.service';
import type { Request, Response } from 'express';

@Controller('uploads')
@Public()
export class UploadsProxyController {
  constructor(private readonly proxy: ProxyService) {}

  @Get('*')
  async getUpload(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxy.forwardBinary(res, 'EMPLOYEE_SERVICE_URL', req.path);
  }
}
