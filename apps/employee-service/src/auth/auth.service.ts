import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { EmployeeEntity } from '../employee/employee.entity';
import {
  type LoginDtoRequest,
  type LoginDtoResponse,
} from '@human-resource-management/shared-types';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(EmployeeEntity)
    private readonly employees: Repository<EmployeeEntity>,
    private readonly jwt: JwtService,
  ) {}

  async login(dto: LoginDtoRequest): Promise<LoginDtoResponse> {
    const employee = await this.employees.findOne({
      where: { email: dto.email },
    });
    if (!employee) throw new UnauthorizedException('Invalid credentials');

    if (dto.roles && !dto.roles.includes(employee.role)) {
      throw new UnauthorizedException('Insufficient permissions');
    }

    const valid = await bcrypt.compare(dto.password, employee.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const payload = {
      sub: employee.id,
      email: employee.email,
      role: employee.role,
    };
    return {
      access_token: this.jwt.sign(payload),
      user: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        position: employee.position,
        phone: employee.phone,
        photoUrl: employee.photoUrl,
      },
    };
  }
}
