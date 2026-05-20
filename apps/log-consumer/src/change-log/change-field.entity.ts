import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { ChangeLogEntity } from './change-log.entity';

@Entity('change_field')
export class ChangeFieldEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  fieldName!: string;

  @Column({ type: 'text', nullable: true })
  oldValue!: string | null;

  @Column({ type: 'text', nullable: true })
  newValue!: string | null;

  @Column('uuid')
  changeLogId!: string;

  @ManyToOne(() => ChangeLogEntity, (log) => log.changes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'change_log_id' })
  changeLog!: ChangeLogEntity;
}
