-- Creates service databases if they do not already exist.
-- This file is executed by the postgres entrypoint via psql on first startup.
SELECT 'CREATE DATABASE employee_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'employee_db')\gexec

SELECT 'CREATE DATABASE attendance_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'attendance_db')\gexec

SELECT 'CREATE DATABASE audit_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'audit_db')\gexec
