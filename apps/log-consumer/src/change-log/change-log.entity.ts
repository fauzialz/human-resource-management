import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ChangeFieldEntity } from './change-field.entity';

@Entity('change_log')
export class ChangeLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  employeeId!: string;

  @Column('uuid')
  changedById!: string;

  @Column({ type: 'timestamp' })
  changedAt!: Date;

  @OneToMany(() => ChangeFieldEntity, (field) => field.changeLog, {
    cascade: true,
  })
  changes!: ChangeFieldEntity[];
}
