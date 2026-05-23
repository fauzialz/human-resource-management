#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
  SELECT 'CREATE DATABASE ${POSTGRES_EMPLOYEE_DB:-employee_db}'
  WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${POSTGRES_EMPLOYEE_DB:-employee_db}')\gexec

  SELECT 'CREATE DATABASE ${POSTGRES_ATTENDANCE_DB:-attendance_db}'
  WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${POSTGRES_ATTENDANCE_DB:-attendance_db}')\gexec

  SELECT 'CREATE DATABASE ${POSTGRES_AUDIT_DB:-audit_db}'
  WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${POSTGRES_AUDIT_DB:-audit_db}')\gexec
EOSQL
