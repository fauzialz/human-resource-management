import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(
      `CREATE TYPE user_role AS ENUM ('employee', 'admin')`,
    );

    await queryRunner.query(`
      CREATE TABLE employees (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR NOT NULL,
        email VARCHAR UNIQUE NOT NULL,
        password_hash VARCHAR NOT NULL,
        phone VARCHAR,
        photo_url VARCHAR,
        position VARCHAR,
        role user_role NOT NULL DEFAULT 'employee',
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        created_by_id UUID NOT NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT now(),
        updated_by_id UUID
      )
    `);

    // Seeded admin — change this password immediately after first login.
    // Fixed UUID so created_by_id can self-reference on first boot.
    await queryRunner.query(`
      INSERT INTO employees (id, name, email, password_hash, role, position, created_by_id)
      VALUES (
        'a0000000-0000-0000-0000-000000000001',
        'Administrator',
        'admin@company.com',
        '$2b$10$nX99z9GveaEStLcJ04wvq.0eEal4qtZJuASdhLW.JHDKtj0/NtTWW',
        'admin',
        'HRD Administrator',
        'a0000000-0000-0000-0000-000000000001'
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM employees WHERE email = 'admin@company.com'`,
    );
    await queryRunner.query(`DROP TABLE employees`);
    await queryRunner.query(`DROP TYPE user_role`);
    await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp"`);
  }
}
