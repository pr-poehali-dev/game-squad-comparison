ALTER TABLE t_p63666683_game_squad_compariso.units
  ADD COLUMN role_new jsonb NOT NULL DEFAULT '[]'::jsonb;

UPDATE t_p63666683_game_squad_compariso.units
  SET role_new = to_json(ARRAY[role])::jsonb;

ALTER TABLE t_p63666683_game_squad_compariso.units
  RENAME COLUMN role TO role_old;

ALTER TABLE t_p63666683_game_squad_compariso.units
  RENAME COLUMN role_new TO role;

ALTER TABLE t_p63666683_game_squad_compariso.units
  ADD COLUMN traits jsonb NOT NULL DEFAULT '[]'::jsonb;