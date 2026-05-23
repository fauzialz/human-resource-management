import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Roles } from '@human-resource-management/common';
import { UserRole } from '@human-resource-management/shared-types';
import type { Response } from 'express';
import type { AuthenticatedRequest } from '../types';
import { ProxyService } from './proxy.service';

type AuthRequest = AuthenticatedRequest;

@Controller('attendance')
export class AttendanceProxyController {
  constructor(private readonly proxy: ProxyService) {}

  @Post('clock-in')
  async clockIn(@Req() req: AuthRequest, @Res() res: Response): Promise<void> {
    await this.proxy.forward(
      req,
      res,
      'ATTENDANCE_SERVICE_URL',
      '/api/attendance/clock-in',
    );
  }

  @Post('clock-out')
  async clockOut(@Req() req: AuthRequest, @Res() res: Response): Promise<void> {
    await this.proxy.forward(
      req,
      res,
      'ATTENDANCE_SERVICE_URL',
      '/api/attendance/clock-out',
    );
  }

  @Get('today')
  async today(@Req() req: AuthRequest, @Res() res: Response): Promise<void> {
    await this.proxy.forward(
      req,
      res,
      'ATTENDANCE_SERVICE_URL',
      '/api/attendance/today',
    );
  }

  @Get('summary')
  async summary(@Req() req: AuthRequest, @Res() res: Response): Promise<void> {
    await this.proxy.forward(
      req,
      res,
      'ATTENDANCE_SERVICE_URL',
      '/api/attendance/summary',
    );
  }

  @Get('all')
  @Roles(UserRole.ADMIN)
  async all(@Req() req: AuthRequest, @Res() res: Response): Promise<void> {
    await this.proxy.forward(
      req,
      res,
      'ATTENDANCE_SERVICE_URL',
      '/api/attendance/all',
    );
  }
}
