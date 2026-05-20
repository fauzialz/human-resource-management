import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import type { ProfileChangeEvent } from '@human-resource-management/shared-types';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;

  constructor(config: ConfigService) {
    this.client = new Redis({
      host: config.get('REDIS_HOST', 'localhost'),
      port: config.get<number>('REDIS_PORT', 6379),
    });
  }

  async publishProfileChange(event: ProfileChangeEvent): Promise<void> {
    await this.client.publish('profile.changes', JSON.stringify(event));
  }

  onModuleDestroy() {
    this.client.disconnect();
  }
}
