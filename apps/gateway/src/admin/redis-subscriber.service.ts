import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { Subject } from 'rxjs';
import type { ProfileChangeEvent } from '@human-resource-management/shared-types';

@Injectable()
export class RedisSubscriberService implements OnModuleInit, OnModuleDestroy {
  private redis!: Redis;
  readonly profileChanges$ = new Subject<ProfileChangeEvent>();

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    this.redis = new Redis({
      host: this.config.get('REDIS_HOST', 'localhost'),
      port: this.config.get<number>('REDIS_PORT', 6379),
    });

    this.redis.subscribe('profile.changes', (err) => {
      if (err) console.error('[Redis] subscribe error:', err);
    });

    this.redis.on('message', (_channel: string, message: string) => {
      try {
        const event = JSON.parse(message) as ProfileChangeEvent;
        this.profileChanges$.next(event);
      } catch {
        // ignore malformed messages
      }
    });
  }

  onModuleDestroy(): void {
    this.profileChanges$.complete();
    this.redis.quit();
  }
}
