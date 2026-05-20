import { Controller, MessageEvent, Sse } from '@nestjs/common';
import { Roles } from '@human-resource-management/common';
import { UserRole } from '@human-resource-management/shared-types';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RedisSubscriberService } from './redis-subscriber.service';

@Controller('admin')
export class AdminEventsController {
  constructor(private readonly redisSubscriber: RedisSubscriberService) {}

  @Sse('events')
  @Roles(UserRole.ADMIN)
  events(): Observable<MessageEvent> {
    return this.redisSubscriber.profileChanges$.pipe(
      map((event) => ({ data: event }) as MessageEvent),
    );
  }
}
