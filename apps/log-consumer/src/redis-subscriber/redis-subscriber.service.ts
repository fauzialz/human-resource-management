import {
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
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
    @InjectDataSource()
    private readonly dataSource: DataSource,
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

    this.dataSource
      .transaction(async (manager) => {
        const changeLog = manager.create(ChangeLogEntity, {
          employeeId: event.employeeId,
          changedById: event.changedById,
          changedAt: new Date(event.changedAt),
        });
        const savedLog = await manager.save(ChangeLogEntity, changeLog);

        const fields = event.changes.map((change) =>
          manager.create(ChangeFieldEntity, {
            changeLogId: savedLog.id,
            fieldName: change.fieldName,
            oldValue: change.oldValue ?? null,
            newValue: change.newValue ?? null,
          }),
        );
        await manager.save(ChangeFieldEntity, fields);
      })
      .catch((err: unknown) => {
        this.logger.error('Failed to save change log', err);
      });
  }
}
