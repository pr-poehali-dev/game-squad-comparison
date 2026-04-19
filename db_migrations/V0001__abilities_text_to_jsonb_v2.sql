ALTER TABLE t_p63666683_game_squad_compariso.units
  ADD COLUMN abilities_new jsonb NOT NULL DEFAULT '[]'::jsonb;

UPDATE t_p63666683_game_squad_compariso.units
  SET abilities_new = array_to_json(abilities)::jsonb;

ALTER TABLE t_p63666683_game_squad_compariso.units
  RENAME COLUMN abilities TO abilities_old;

ALTER TABLE t_p63666683_game_squad_compariso.units
  RENAME COLUMN abilities_new TO abilities;