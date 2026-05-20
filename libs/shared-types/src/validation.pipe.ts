// Usage in a NestJS controller:
//
// import { ZodValidationPipe } from '@human-resource-management/shared-types'
// import { LoginSchema, LoginDto } from '@human-resource-management/shared-types'
//
// @Post('login')
// login(@Body(new ZodValidationPipe(LoginSchema)) dto: LoginDto) {
//   return this.authService.login(dto)
// }
//
// For @Query() params:
// @Get('summary')
// summary(@Query(new ZodValidationPipe(AttendanceSummaryQuerySchema)) query: AttendanceSummaryQuery) {
//   return this.attendanceService.getSummary(query)
// }

import { PipeTransform, BadRequestException } from '@nestjs/common';
import z, { ZodType } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodType) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: z.flattenError(result.error),
        statusCode: 400,
      });
    }
    return result.data;
  }
}
