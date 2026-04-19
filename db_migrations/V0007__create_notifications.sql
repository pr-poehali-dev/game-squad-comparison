CREATE TABLE t_p63666683_game_squad_compariso.notifications (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES t_p63666683_game_squad_compariso.users(id),
  message text NOT NULL,
  link_topic_id integer REFERENCES t_p63666683_game_squad_compariso.forum_topics(id),
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);