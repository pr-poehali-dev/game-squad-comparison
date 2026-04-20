CREATE TABLE IF NOT EXISTS t_p63666683_game_squad_compariso.game_scores (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES t_p63666683_game_squad_compariso.users(id),
  score INTEGER NOT NULL DEFAULT 0,
  misses INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_game_scores_score ON t_p63666683_game_squad_compariso.game_scores(score DESC);
