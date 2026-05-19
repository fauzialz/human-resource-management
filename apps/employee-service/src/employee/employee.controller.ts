import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
  UploadedFile,
  UseInterceptors,
  ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Request as ExpressRequest } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import type { JwtPayload } from '../auth/jwt.strategy';
import { EmployeeService } from './employee.service';
import {
  UserRole,
  CreateEmployeeSchema,
  UpdateEmployeeSchema,
  ZodValidationPipe,
} from '@human-resource-management/shared-types';
import type {
  CreateEmployeeDto,
  UpdateEmployeeDto,
} from '@human-resource-management/shared-types';

type AuthRequest = ExpressRequest & { user: JwtPayload };

const photoStorage = diskStorage({
  destination: './uploads',
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${extname(file.originalname)}`);
  },
});

@Controller('employees')
@UseGuards(JwtAuthGuard)
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.employeeService.findAll();
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('photo', { storage: photoStorage }))
  create(
    @Body(new ZodValidationPipe(CreateEmployeeSchema)) dto: CreateEmployeeDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Request() req: AuthRequest,
  ) {
    const photoUrl = file ? `uploads/${file.filename}` : dto.photoUrl;
    return this.employeeService.create({
      ...dto,
      photoUrl,
      createdById: req.user.sub,
    });
  }

  @Get(':id')
  async getProfile(@Param('id') id: string, @Request() req: AuthRequest) {
    if (req.user.sub !== id && req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException();
    }
    return this.employeeService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @UseInterceptors(FileInterceptor('photo', { storage: photoStorage }))
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateEmployeeSchema)) dto: UpdateEmployeeDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Request() req: AuthRequest,
  ) {
    if (req.user.role === UserRole.EMPLOYEE && req.user.sub !== id) {
      throw new ForbiddenException();
    }

    const photoUrl = file ? `uploads/${file.filename}` : dto.photoUrl;
    const payload: UpdateEmployeeDto =
      req.user.role === UserRole.EMPLOYEE
        ? {
            phone: dto.phone,
            password: dto.password,
            photoUrl,
            updatedById: req.user.sub,
          }
        : { ...dto, photoUrl, updatedById: req.user.sub };

    return this.employeeService.update(id, {
      ...payload,
      updatedById: req.user.sub,
    });
  }

  @Patch(':id/password')
  async updatePassword(
    @Param('id') id: string,
    @Body('password') password: string,
    @Request() req: AuthRequest,
  ) {
    if (req.user.sub !== id) throw new ForbiddenException();
    await this.employeeService.updatePassword(id, password, req.user.sub);
    return { message: 'Password updated' };
  }
}
