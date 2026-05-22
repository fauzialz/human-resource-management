import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ChangeFieldEntity } from './change-field.entity';

@Entity('change_log')
export class ChangeLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'employee_id', type: 'uuid' })
  employeeId!: string;

  @Column({ name: 'changed_by_id', type: 'uuid' })
  changedById!: string;

  @Column({ name: 'changed_at', type: 'timestamp' })
  changedAt!: Date;

  @OneToMany(() => ChangeFieldEntity, (field) => field.changeLog, {
    cascade: true,
  })
  changes!: ChangeFieldEntity[];
}
