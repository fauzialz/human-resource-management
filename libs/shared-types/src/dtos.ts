import { z } from 'zod';
import { UserRole, AttendanceStatus } from './enums';
import { AttendanceRecord } from './entities';

export const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  roles: z.array(z.enum(UserRole)).optional(),
});
export type LoginDtoRequest = z.infer<typeof LoginSchema>;

export type LoginDtoResponse = {
  access_token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    position: string;
    phone: string;
    photoUrl?: string;
  };
};

export const CreateEmployeeSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  photoUrl: z.url().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters long'),
  position: z.string().min(1),
  role: z.enum(UserRole),
});
export type CreateEmployeeDto = z.infer<typeof CreateEmployeeSchema>;

export const UpdateEmployeeSchema = CreateEmployeeSchema.partial().extend({
  removePhoto: z.enum(['true']).optional(),
});
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
export interface AttendanceAllResponse
  extends Omit<AttendanceRecord, 'employeeId'> {
  employee: {
    id: string;
    name: string;
    role: UserRole;
    position: string;
  };
}
