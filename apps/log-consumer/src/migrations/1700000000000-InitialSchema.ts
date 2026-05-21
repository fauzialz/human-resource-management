import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE change_log (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        employee_id UUID NOT NULL,
        changed_by_id UUID NOT NULL,
        changed_at TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE change_log_fields (
        id SERIAL PRIMARY KEY,
        change_log_id UUID NOT NULL REFERENCES change_log(id) ON DELETE CASCADE,
        field_name VARCHAR NOT NULL,
        old_value TEXT,
        new_value TEXT
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE change_log_fields`);
    await queryRunner.query(`DROP TABLE change_log`);
  }
}
