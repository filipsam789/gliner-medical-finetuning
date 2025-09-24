-- Basic PostgreSQL setup for Keycloak
-- Keycloak will create its own tables automatically

-- Create database only if it doesn't exist (POSTGRES_DB might have created it)
SELECT 'CREATE DATABASE gliner'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'gliner')\gexec