import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { EmployeeEntity } from './employee.entity';
import { RedisService } from '../redis/redis.service';
import type {
  ChangeFieldEvent,
  CreateEmployeeDto,
  UpdateEmployeeDto,
} from '@human-resource-management/shared-types';

const employeeUpdateKeys: (keyof EmployeeEntity)[] = [
  'name',
  'email',
  'phone',
  'photoUrl',
  'position',
  'role',
  'passwordHash',
];

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(EmployeeEntity)
    private readonly repo: Repository<EmployeeEntity>,
    private readonly redis: RedisService,
  ) {}

  findAll(): Promise<EmployeeEntity[]> {
    return this.repo.find();
  }

  async findOne(id: string): Promise<EmployeeEntity> {
    const emp = await this.repo.findOne({ where: { id } });
    if (!emp) throw new NotFoundException(`Employee ${id} not found`);
    return emp;
  }

  async create(dto: CreateEmployeeDto): Promise<EmployeeEntity> {
    const emp = this.repo.create({
      name: dto.name,
      email: dto.email,
      photoUrl: dto.photoUrl,
      passwordHash: dto.password,
      phone: dto.phone,
      position: dto.position,
      role: dto.role,
      createdById: dto.createdById,
    });
    return this.repo.save(emp);
  }

  async update(id: string, dto: UpdateEmployeeDto): Promise<EmployeeEntity> {
    const emp = await this.findOne(id);
    const oldData = { ...emp };
    const { password: _pass, ...rest } = dto;

    if (dto.password) {
      emp.passwordHash = await bcrypt.hash(dto.password, 10);
    }
    Object.assign(emp, rest);
    const saved = await this.repo.save(emp);

    // Prepare change events for fields that were updated
    const changes: ChangeFieldEvent[] = [];
    for (const key of employeeUpdateKeys) {
      if (!(key in dto)) continue; // Skip if field not in update DTO
      const oldValue = String((oldData as any)?.[key] ?? '');
      const newValue = String((emp as any)?.[key] ?? '');
      if (key === 'passwordHash') {
        if (await bcrypt.compare(oldValue, newValue)) {
          changes.push({
            fieldName: 'password',
            oldValue: '',
            newValue: '',
          });
        }
        continue;
      }

      if (oldValue !== newValue) {
        changes.push({
          fieldName: key,
          oldValue,
          newValue,
        });
      }
    }

    await this.redis.publishProfileChange({
      employeeId: id,
      changes,
      changedAt: new Date(),
      changedById: dto.updatedById,
    });

    return saved;
  }

  async updatePassword(
    id: string,
    newPassword: string,
    updatedById: string,
  ): Promise<void> {
    const emp = await this.findOne(id);
    emp.passwordHash = await bcrypt.hash(newPassword, 10);
    await this.repo.save(emp);
    await this.redis.publishProfileChange({
      employeeId: id,
      changes: [
        {
          fieldName: 'password',
          oldValue: '',
          newValue: '',
        },
      ],
      changedAt: new Date(),
      changedById: updatedById,
    });
  }
}
