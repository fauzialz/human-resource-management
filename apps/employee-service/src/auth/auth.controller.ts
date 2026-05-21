import { Controller, Post, Body } from '@nestjs/common';
import { SkipInternalGuard } from '@human-resource-management/common';
import { AuthService } from './auth.service';
import {
  LoginSchema,
  UserRole,
  ZodValidationPipe,
} from '@human-resource-management/shared-types';
import type { LoginDtoRequest } from '@human-resource-management/shared-types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @SkipInternalGuard()
  @Post('login')
  login(@Body(new ZodValidationPipe(LoginSchema)) dto: LoginDtoRequest) {
    return this.authService.login(dto);
  }

  @SkipInternalGuard()
  @Post('login-admin')
  loginAdmin(@Body(new ZodValidationPipe(LoginSchema)) dto: LoginDtoRequest) {
    return this.authService.login({ ...dto, roles: [UserRole.ADMIN] });
  }
}
