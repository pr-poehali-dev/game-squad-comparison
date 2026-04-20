CREATE TABLE IF NOT EXISTS t_p63666683_game_squad_compariso.unit_roles (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO t_p63666683_game_squad_compariso.unit_roles (name, description) VALUES
  ('Танк',      'Выдерживает удары противника, защищает союзников, держит линию фронта'),
  ('Урон',      'Наносит максимальный урон по вражеским отрядам'),
  ('Поддержка', 'Усиливает союзников, лечит и обеспечивает тактическое преимущество'),
  ('Разведчик', 'Быстрый отряд для разведки, преследования и фланговых атак'),
  ('Контроль',  'Замедляет, оглушает и ограничивает передвижение противника')
ON CONFLICT (name) DO NOTHING;
