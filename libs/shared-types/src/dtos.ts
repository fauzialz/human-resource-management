import { z } from 'zod';
import { UserRole, AttendanceStatus } from './enums.ts';

export const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});
export type LoginDto = z.infer<typeof LoginSchema>;

// export const UpdateProfileSchema = z.object({
//   phone: z.string().optional(),
//   password: z.string().min(8).optional(),
// });
// export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;

export const CreateEmployeeSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  photoUrl: z.url().optional(),
  password: z.string().min(8),
  phone: z.string(),
  position: z.string().min(1),
  role: z.enum(UserRole),
  createdById: z.string(),
});
export type CreateEmployeeDto = z.infer<typeof CreateEmployeeSchema>;

export const UpdateEmployeeSchema = CreateEmployeeSchema.partial().and(
  z.object({
    updatedById: z.string(),
  }),
);
export type UpdateEmployeeDto = z.infer<typeof UpdateEmployeeSchema>;

export const ClockSchema = z.object({
  status: z.enum(AttendanceStatus),
});
export type ClockDto = z.infer<typeof ClockSchema>;

export const AttendanceSummaryQuerySchema = z.object({
  from: z.iso.datetime({ offset: true }),
  to: z.iso.datetime({ offset: true }),
});
export type AttendanceSummaryQuery = z.infer<
  typeof AttendanceSummaryQuerySchema
>;
