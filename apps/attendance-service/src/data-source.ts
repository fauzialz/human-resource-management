// Used by TypeORM CLI only (migration:run/generate/revert). Not imported by NestJS.
import 'dotenv/config';
import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'postgres',
  host: process.env['POSTGRES_HOST'] ?? 'localhost',
  port: parseInt(process.env['POSTGRES_PORT'] ?? '5432', 10),
  username: process.env['POSTGRES_USER'],
  password: process.env['POSTGRES_PASSWORD'],
  database: process.env['POSTGRES_ATTENDANCE_DB'] ?? 'attendance_db',
  entities: ['apps/attendance-service/src/**/*.entity.ts'],
  migrations: ['apps/attendance-service/src/migrations/*.ts'],
  synchronize: false,
  logging: true,
});
