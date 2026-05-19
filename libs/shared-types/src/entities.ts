import { UserRole } from './enums.ts';

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  photoUrl: string;
  position: string;
  role: UserRole;
  createdAt: Date;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: Date;
  clockIn: Date;
  clockOut: Date | null;
  createdAt: Date;
}
