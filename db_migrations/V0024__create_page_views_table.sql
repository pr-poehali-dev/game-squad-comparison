CREATE TABLE t_p63666683_game_squad_compariso.page_views (
  id bigserial PRIMARY KEY,
  visited_at timestamp with time zone NOT NULL DEFAULT now(),
  path text NOT NULL DEFAULT '/',
  user_id integer NULL,
  session_id text NULL,
  ip_address text NULL
);