import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CurrentUser, Roles } from '@human-resource-management/common';
import type { RequestUser } from '@human-resource-management/common';
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

const photoStorage = diskStorage({
  destination: './uploads',
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${extname(file.originalname)}`);
  },
});

@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.employeeService.findAll();
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('photo', { storage: photoStorage }))
  create(
    @Body(new ZodValidationPipe(CreateEmployeeSchema)) dto: CreateEmployeeDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser() user: RequestUser,
  ) {
    const photoUrl = file ? `uploads/${file.filename}` : dto.photoUrl;
    return this.employeeService.create({ ...dto, photoUrl }, user.id);
  }

  @Get(':id')
  async getProfile(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    if (user.id !== id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException();
    }
    return this.employeeService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @UseInterceptors(FileInterceptor('photo', { storage: photoStorage }))
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateEmployeeSchema)) dto: UpdateEmployeeDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser() user: RequestUser,
  ) {
    if (user.role === UserRole.EMPLOYEE && user.id !== id) {
      throw new ForbiddenException();
    }

    const photoUrl = file ? `uploads/${file.filename}` : dto.photoUrl;
    const payload: UpdateEmployeeDto =
      user.role === UserRole.EMPLOYEE
        ? {
            phone: dto.phone,
            password: dto.password,
            photoUrl,
            removePhoto: dto.removePhoto,
          }
        : { ...dto, photoUrl };

    return this.employeeService.update(id, payload, user.id);
  }

  @Patch(':id/password')
  async updatePassword(
    @Param('id') id: string,
    @Body('password') password: string,
    @CurrentUser() user: RequestUser,
  ) {
    if (user.id !== id) throw new ForbiddenException();
    await this.employeeService.updatePassword(id, password, user.id);
    return { message: 'Password updated' };
  }
}
