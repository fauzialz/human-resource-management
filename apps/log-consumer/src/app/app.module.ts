import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChangeLogEntity } from '../change-log/change-log.entity';
import { ChangeFieldEntity } from '../change-log/change-field.entity';
import { RedisSubscriberService } from '../redis-subscriber/redis-subscriber.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('POSTGRES_HOST', 'localhost'),
        port: config.get<number>('POSTGRES_PORT', 5432),
        username: config.getOrThrow<string>('POSTGRES_USER'),
        password: config.getOrThrow<string>('POSTGRES_PASSWORD'),
        database: config.getOrThrow<string>('POSTGRES_AUDIT_DB'),
        entities: [ChangeLogEntity, ChangeFieldEntity],
        synchronize: false,
        migrationsRun: false,
        migrations: [__dirname + '/migrations/*.ts'],
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([ChangeLogEntity, ChangeFieldEntity]),
  ],
  providers: [RedisSubscriberService],
})
export class AppModule {}
