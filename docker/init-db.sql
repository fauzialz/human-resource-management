-- Creates audit_db if it does not already exist.
-- This file is executed by the postgres entrypoint via psql on first startup.
SELECT 'CREATE DATABASE audit_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'audit_db')\gexec
