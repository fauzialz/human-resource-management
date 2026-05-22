import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@human-resource-management/shared-types';

@Entity('employees')
export class EmployeeEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column({ nullable: true })
  phone!: string;

  @Column({ name: 'photo_url', nullable: true, type: 'varchar' })
  photoUrl!: string | null;

  @Column()
  position!: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.EMPLOYEE })
  role!: UserRole;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column({ name: 'created_by_id' })
  createdById!: string;

  @ManyToOne(() => EmployeeEntity, { nullable: true, eager: false })
  @JoinColumn({ name: 'created_by_id' })
  createdBy!: EmployeeEntity | null;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ name: 'updated_by_id', nullable: true })
  updatedById!: string | null;

  @ManyToOne(() => EmployeeEntity, { nullable: true, eager: false })
  @JoinColumn({ name: 'updated_by_id' })
  updatedBy!: EmployeeEntity | null;

  @BeforeInsert()
  async hashPassword() {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
  }
}
