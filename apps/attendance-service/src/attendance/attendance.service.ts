import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { AttendanceRecord } from './attendance-record.entity';
import {
  AttendanceAllResponse,
  Employee,
  UserRole,
} from '@human-resource-management/shared-types';
import { RequestUser } from '@human-resource-management/common';

function todayDateStr(): string {
  return new Date().toISOString().split('T')[0];
}

function startOfMonthDateStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

function startOfDay(dateStr: string): Date {
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(dateStr: string): Date {
  const d = new Date(dateStr);
  d.setHours(23, 59, 59, 999);
  return d;
}

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceRecord)
    private readonly repo: Repository<AttendanceRecord>,
    private readonly config: ConfigService,
  ) {}

  private findTodayRecord(
    employeeId: string,
  ): Promise<AttendanceRecord | null> {
    const today = todayDateStr();
    return this.repo.findOne({
      where: {
        employeeId,
        createdAt: Between(startOfDay(today), endOfDay(today)),
      },
    });
  }

  async clockIn(employeeId: string): Promise<AttendanceRecord> {
    const existing = await this.findTodayRecord(employeeId);
    if (existing) {
      throw new BadRequestException('Already clocked in today');
    }
    const record = this.repo.create({
      employeeId,
      clockIn: new Date(),
      clockOut: null,
    });
    return this.repo.save(record);
  }

  async clockOut(employeeId: string): Promise<AttendanceRecord> {
    const record = await this.findTodayRecord(employeeId);
    if (!record?.clockIn) {
      throw new BadRequestException('Not clocked in today');
    }
    if (record.clockOut) {
      throw new BadRequestException('Already clocked out today');
    }
    record.clockOut = new Date();
    return this.repo.save(record);
  }

  today(employeeId: string): Promise<AttendanceRecord | null> {
    return this.findTodayRecord(employeeId);
  }

  summary(
    employeeId: string,
    from: string = startOfMonthDateStr(),
    to: string = todayDateStr(),
  ): Promise<AttendanceRecord[]> {
    return this.repo.find({
      where: { employeeId, createdAt: Between(startOfDay(from), endOfDay(to)) },
      order: { createdAt: 'DESC' },
    });
  }

  async all(
    from: string = startOfMonthDateStr(),
    to: string = todayDateStr(),
    user: RequestUser,
  ): Promise<AttendanceAllResponse[]> {
    const records = await this.repo.find({
      where: { createdAt: Between(startOfDay(from), endOfDay(to)) },
      order: { createdAt: 'DESC', employeeId: 'ASC' },
    });

    const employeeIds = [...new Set(records.map((r) => r.employeeId))];
    const employeeMap = new Map<string, Employee>();

    // Fetch employee details from employee service
    if (employeeIds.length > 0) {
      const baseUrl = this.config.get(
        'EMPLOYEE_SERVICE_URL',
        'http://localhost:3001',
      );
      const res = await fetch(
        `${baseUrl}/api/employees?ids=${employeeIds.join(',')}`,
        {
          headers: {
            'x-user-id': user.id,
            'x-user-role': user.role,
          },
        },
      );
      if (res.ok) {
        const employees = (await res.json()) as Employee[];
        for (const emp of employees) {
          employeeMap.set(emp.id, emp);
        }
      }
    }

    return records.map((record) => {
      const emp = employeeMap.get(record.employeeId);
      return {
        id: record.id,
        clockIn: record.clockIn,
        clockOut: record.clockOut,
        createdAt: record.createdAt,
        employee: {
          id: record.employeeId,
          name: emp?.name ?? 'Unknown',
          position: emp?.position ?? '',
          role: emp?.role ?? UserRole.EMPLOYEE,
        },
      };
    });
  }
}
