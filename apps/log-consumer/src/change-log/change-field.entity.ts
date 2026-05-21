import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { ChangeLogEntity } from './change-log.entity';

@Entity('change_log_fields')
export class ChangeFieldEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'field_name', type: 'varchar' })
  fieldName!: string;

  @Column({ name: 'old_value', type: 'text', nullable: true })
  oldValue!: string | null;

  @Column({ name: 'new_value', type: 'text', nullable: true })
  newValue!: string | null;

  @Column({ name: 'change_log_id', type: 'uuid' })
  changeLogId!: string;

  @ManyToOne(() => ChangeLogEntity, (log) => log.changes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'change_log_id' })
  changeLog!: ChangeLogEntity;
}
