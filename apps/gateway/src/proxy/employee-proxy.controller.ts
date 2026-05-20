import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Roles } from '@human-resource-management/common';
import { UserRole } from '@human-resource-management/shared-types';
import type { Response } from 'express';
import type { AuthenticatedRequest } from '../types';
import { ProxyService } from './proxy.service';

type AuthRequest = AuthenticatedRequest;

@Controller('employees')
export class EmployeeProxyController {
  constructor(private readonly proxy: ProxyService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  async listEmployees(
    @Req() req: AuthRequest,
    @Res() res: Response,
  ): Promise<void> {
    await this.proxy.forward(
      req,
      res,
      'EMPLOYEE_SERVICE_URL',
      '/api/employees',
    );
  }

  @Post()
  @Roles(UserRole.ADMIN)
  async createEmployee(
    @Req() req: AuthRequest,
    @Res() res: Response,
  ): Promise<void> {
    await this.proxy.forwardAuto(
      req,
      res,
      'EMPLOYEE_SERVICE_URL',
      '/api/employees',
    );
  }

  @Get(':id')
  async getEmployee(
    @Param('id') id: string,
    @Req() req: AuthRequest,
    @Res() res: Response,
  ): Promise<void> {
    await this.proxy.forward(
      req,
      res,
      'EMPLOYEE_SERVICE_URL',
      `/api/employees/${id}`,
    );
  }

  @Patch(':id')
  async updateEmployee(
    @Param('id') id: string,
    @Req() req: AuthRequest,
    @Res() res: Response,
  ): Promise<void> {
    await this.proxy.forwardAuto(
      req,
      res,
      'EMPLOYEE_SERVICE_URL',
      `/api/employees/${id}`,
    );
  }

  @Patch(':id/password')
  async updatePassword(
    @Param('id') id: string,
    @Req() req: AuthRequest,
    @Res() res: Response,
  ): Promise<void> {
    if (req.user.id !== id)
      throw new ForbiddenException('You can only change your own password');
    await this.proxy.forward(
      req,
      res,
      'EMPLOYEE_SERVICE_URL',
      `/api/employees/${id}/password`,
    );
  }
}
