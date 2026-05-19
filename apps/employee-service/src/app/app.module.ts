import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../auth/auth.module';
import { EmployeeModule } from '../employee/employee.module';
import { EmployeeEntity } from '../employee/employee.entity';
import {
  InternalOnlyGuard,
  RolesGuard,
} from '@human-resource-management/common';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('POSTGRES_HOST', 'localhost'),
        port: config.get<number>('POSTGRES_PORT', 5432),
        username: config.get('POSTGRES_USER'),
        password: config.get('POSTGRES_PASSWORD'),
        database: config.get('POSTGRES_DB', 'attendance_db'),
        entities: [EmployeeEntity],
        synchronize: config.get('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    EmployeeModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: InternalOnlyGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
