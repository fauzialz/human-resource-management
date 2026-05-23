import { Controller, Get, Post, Query } from '@nestjs/common';
import { CurrentUser, Roles } from '@human-resource-management/common';
import type { RequestUser } from '@human-resource-management/common';
import {
  AttendanceAllResponse,
  UserRole,
} from '@human-resource-management/shared-types';
import { AttendanceService } from './attendance.service';
import { AttendanceRecord } from './attendance-record.entity';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('clock-in')
  clockIn(@CurrentUser() user: RequestUser): Promise<AttendanceRecord> {
    return this.attendanceService.clockIn(user.id);
  }

  @Post('clock-out')
  clockOut(@CurrentUser() user: RequestUser): Promise<AttendanceRecord> {
    return this.attendanceService.clockOut(user.id);
  }

  @Get('today')
  today(@CurrentUser() user: RequestUser): Promise<AttendanceRecord | null> {
    return this.attendanceService.today(user.id);
  }

  @Get('summary')
  summary(
    @CurrentUser() user: RequestUser,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<AttendanceRecord[]> {
    return this.attendanceService.summary(user.id, from, to);
  }

  @Get('all')
  @Roles(UserRole.ADMIN)
  all(
    @CurrentUser() user: RequestUser,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<AttendanceAllResponse[]> {
    return this.attendanceService.all(from, to, user);
  }
}
