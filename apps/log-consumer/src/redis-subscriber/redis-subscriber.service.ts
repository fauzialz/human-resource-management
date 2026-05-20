import {
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Redis from 'ioredis';
import { ProfileChangeEvent } from '@human-resource-management/shared-types';
import { ChangeLogEntity } from '../change-log/change-log.entity';
import { ChangeFieldEntity } from '../change-log/change-field.entity';

@Injectable()
export class RedisSubscriberService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(RedisSubscriberService.name);
  private readonly subscriber: Redis;

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(ChangeLogEntity)
    private readonly changeLogRepo: Repository<ChangeLogEntity>,
  ) {
    this.subscriber = new Redis({
      host: this.config.getOrThrow<string>('REDIS_HOST'),
      port: this.config.getOrThrow<number>('REDIS_PORT'),
    });
  }

  async onApplicationBootstrap() {
    await this.subscriber.subscribe('profile.changes');
    this.subscriber.on('message', (_channel: string, message: string) => {
      this.handleMessage(message);
    });
    this.logger.log('Subscribed to Redis channel: profile.changes');
  }

  async onApplicationShutdown() {
    await this.subscriber.quit();
  }

  private handleMessage(message: string) {
    let event: ProfileChangeEvent;
    try {
      event = JSON.parse(message) as ProfileChangeEvent;
    } catch {
      this.logger.warn(`Failed to parse message: ${message}`);
      return;
    }

    const changeLog = this.changeLogRepo.create({
      employeeId: event.employeeId,
      changedById: event.changedById,
      changedAt: new Date(event.changedAt),
      changes: event.changes.map((change) => {
        const field = new ChangeFieldEntity();
        field.fieldName = change.fieldName;
        field.oldValue = change.oldValue ?? null;
        field.newValue = change.newValue ?? null;
        return field;
      }),
    });

    this.changeLogRepo.save(changeLog).catch((err: unknown) => {
      this.logger.error('Failed to save change log', err);
    });
  }
}
