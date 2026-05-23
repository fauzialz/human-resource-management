import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, In, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { EmployeeEntity } from './employee.entity';
import { RedisService } from '../redis/redis.service';
import type {
  ChangeFieldEvent,
  CreateEmployeeDto,
  Employee,
  UpdateEmployeeDto,
} from '@human-resource-management/shared-types';

type FieldNames = Exclude<keyof UpdateEmployeeDto, 'removePhoto'>;

const EMPLOYEE_UPDATE_KEY_COLUMN: Record<FieldNames, string> = {
  name: 'name',
  email: 'email',
  phone: 'phone',
  photoUrl: 'photo_url',
  position: 'position',
  role: 'role',
  password: 'password_hash',
};

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(EmployeeEntity)
    private readonly repo: Repository<EmployeeEntity>,
    private readonly redis: RedisService,
  ) {}

  private toEmployee(entity: EmployeeEntity): Employee {
    return {
      id: entity.id,
      name: entity.name,
      email: entity.email,
      phone: entity.phone,
      photoUrl: entity.photoUrl ?? '',
      position: entity.position,
      role: entity.role,
      createdAt: entity.createdAt,
    };
  }

  private async findOneEntity(id: string): Promise<EmployeeEntity> {
    const emp = await this.repo.findOne({ where: { id } });
    if (!emp) throw new NotFoundException(`Employee ${id} not found`);
    return emp;
  }

  async findAll(ids?: string[]): Promise<Employee[]> {
    let options: FindManyOptions<EmployeeEntity> | undefined = undefined;
    if (ids && ids.length > 0) {
      options = { where: { id: In(ids) } };
    }
    const entities = await this.repo.find(options);
    return entities.map((e) => this.toEmployee(e));
  }

  async findOne(id: string): Promise<Employee> {
    return this.toEmployee(await this.findOneEntity(id));
  }

  async create(dto: CreateEmployeeDto, createdById: string): Promise<Employee> {
    const emp = this.repo.create({
      name: dto.name,
      email: dto.email,
      photoUrl: dto.photoUrl,
      passwordHash: dto.password,
      phone: dto.phone,
      position: dto.position,
      role: dto.role,
      createdById: createdById,
    });
    return this.toEmployee(await this.repo.save(emp));
  }

  async update(
    id: string,
    dto: UpdateEmployeeDto,
    updatedById: string,
  ): Promise<Employee> {
    const emp = await this.findOneEntity(id);
    const oldData = { ...emp };
    const { password: _pass, removePhoto, ...rest } = dto;

    if (dto.password) {
      emp.passwordHash = await bcrypt.hash(dto.password, 10);
    }
    const defined = Object.fromEntries(
      Object.entries(rest).filter(([, v]) => v !== undefined),
    );
    Object.assign(emp, defined);

    // We need removePhoto flag because if photoUrl is set to null, it can mean either "no change"
    // or "remove photo". The flag disambiguates this. If removePhoto is true, we remove the photo
    // regardless of photoUrl value. If removePhoto is false, we only update photo if photoUrl is
    // provided.
    if (removePhoto === 'true' || dto.photoUrl != undefined) {
      if (oldData.photoUrl) {
        await unlink(join(process.cwd(), oldData.photoUrl)).catch(() => {});
      }
      emp.photoUrl = dto.photoUrl ?? null;
    }
    const saved = await this.repo.save(emp);

    // Prepare change events for fields that were updated
    const changes: ChangeFieldEvent[] = [];
    for (const key in EMPLOYEE_UPDATE_KEY_COLUMN) {
      if (!(key in dto)) continue; // Skip if field not in update DTO
      const oldValue = String((oldData as any)?.[key] ?? '');
      const newValue = String((saved as any)?.[key] ?? '');
      const fieldName = EMPLOYEE_UPDATE_KEY_COLUMN[key as FieldNames];

      if (key === 'photoUrl' && removePhoto !== 'true' && !dto.photoUrl) {
        continue; // Skip photoUrl change if not actually updated
      }

      if (key === 'password' && dto.password) {
        if (!(await bcrypt.compare(dto.password, oldValue))) {
          changes.push({
            fieldName,
            oldValue: '',
            newValue: '',
          });
        }
        continue;
      }

      if (oldValue !== newValue) {
        changes.push({
          fieldName,
          oldValue,
          newValue,
        });
      }
    }

    if (changes.length > 0) {
      await this.redis.publishProfileChange({
        employeeId: id,
        employeeName: emp.name,
        changes,
        changedAt: new Date(),
        changedById: updatedById,
      });
    }

    return this.toEmployee(saved);
  }

  async updatePassword(
    id: string,
    newPassword: string,
    updatedById: string,
  ): Promise<void> {
    const emp = await this.findOneEntity(id);
    emp.passwordHash = await bcrypt.hash(newPassword, 10);
    await this.repo.save(emp);
    await this.redis.publishProfileChange({
      employeeId: id,
      employeeName: emp.name,
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
