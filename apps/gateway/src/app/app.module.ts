import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { AdminEventsController } from '../admin/admin-events.controller';
import { RedisSubscriberService } from '../admin/redis-subscriber.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { GatewayRolesGuard } from '../guards/roles.guard';
import { AttendanceProxyController } from '../proxy/attendance-proxy.controller';
import { AuthProxyController } from '../proxy/auth-proxy.controller';
import { EmployeeProxyController } from '../proxy/employee-proxy.controller';
import { ProxyService } from '../proxy/proxy.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [
    AppController,
    AuthProxyController,
    EmployeeProxyController,
    AttendanceProxyController,
    AdminEventsController,
  ],
  providers: [
    AppService,
    ProxyService,
    RedisSubscriberService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: GatewayRolesGuard },
  ],
})
export class AppModule {}
