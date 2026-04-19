ALTER TABLE t_p63666683_game_squad_compariso.units
  ADD COLUMN stars numeric(3,1) NOT NULL DEFAULT 0
  CHECK (stars >= 0 AND stars <= 5);