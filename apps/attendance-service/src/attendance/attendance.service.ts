import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { AttendanceRecord } from './attendance-record.entity';

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

  all(
    from: string = startOfMonthDateStr(),
    to: string = todayDateStr(),
  ): Promise<AttendanceRecord[]> {
    return this.repo.find({
      where: { createdAt: Between(startOfDay(from), endOfDay(to)) },
      order: { createdAt: 'DESC', employeeId: 'ASC' },
    });
  }
}
