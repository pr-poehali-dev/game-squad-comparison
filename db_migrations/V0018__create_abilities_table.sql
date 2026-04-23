CREATE TABLE IF NOT EXISTS abilities (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  stat_modifiers JSONB NOT NULL DEFAULT '{}',
  stat_modifiers_ex JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);