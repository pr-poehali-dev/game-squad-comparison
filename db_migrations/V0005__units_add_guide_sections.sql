ALTER TABLE t_p63666683_game_squad_compariso.units
  ADD COLUMN guide_upgrade jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN guide_gameplay jsonb NOT NULL DEFAULT '[]'::jsonb;