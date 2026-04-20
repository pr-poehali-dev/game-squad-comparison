CREATE TABLE IF NOT EXISTS t_p63666683_game_squad_compariso.formations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  avatar_url TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE t_p63666683_game_squad_compariso.units
  ADD COLUMN IF NOT EXISTS formations jsonb NOT NULL DEFAULT '[]'::jsonb;
