UPDATE t_p63666683_game_squad_compariso.units
SET role = COALESCE(
  (
    SELECT jsonb_agg(r)
    FROM jsonb_array_elements_text(role::jsonb) AS r
    WHERE r IN ('Танк', 'Борьба с кавалерией')
  ),
  '[]'::jsonb
)
WHERE role IS NOT NULL;
