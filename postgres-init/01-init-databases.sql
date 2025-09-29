-- Basic PostgreSQL setup for Keycloak
-- Keycloak will create its own tables automatically

-- Create database only if it doesn't exist (POSTGRES_DB might have created it)
SELECT 'CREATE DATABASE gliner'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'gliner')\gexec

CREATE SCHEMA IF NOT EXISTS experiments;

CREATE TABLE IF NOT EXISTS experiments.experiments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(128) NOT NULL
);

CREATE TABLE IF NOT EXISTS experiments.documents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    image_url TEXT,
    experiment_id INTEGER REFERENCES experiments.experiments(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS experiments.experiment_runs (
    id SERIAL PRIMARY KEY,
    model VARCHAR(255) NOT NULL,
    labels_to_extract TEXT NOT NULL,
    allow_multilabeling BOOLEAN NOT NULL,
    threshold FLOAT,
    experiment_id INTEGER REFERENCES experiments.experiments(id) ON DELETE CASCADE,
    date_ran TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS experiments.daily_usage (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(128) NOT NULL,
    usage_date DATE NOT NULL,
    usage_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create unique index for efficient queries and data integrity
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_usage_user_date 
ON experiments.daily_usage (user_id, usage_date);