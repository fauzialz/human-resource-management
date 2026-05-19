import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('attendance_records')
export class AttendanceRecord {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'employee_id', type: 'uuid' })
  employeeId!: string;

  @Column({ name: 'clock_in', type: 'timestamp', nullable: true })
  clockIn!: Date | null;

  @Column({ name: 'clock_out', type: 'timestamp', nullable: true })
  clockOut!: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
