CREATE TABLE t_p63666683_game_squad_compariso.forum_topics (
  id serial PRIMARY KEY,
  title varchar(255) NOT NULL,
  content text NOT NULL DEFAULT '',
  author_id integer NOT NULL REFERENCES t_p63666683_game_squad_compariso.users(id),
  views integer NOT NULL DEFAULT 0,
  is_pinned boolean NOT NULL DEFAULT false,
  is_locked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE t_p63666683_game_squad_compariso.forum_posts (
  id serial PRIMARY KEY,
  topic_id integer NOT NULL REFERENCES t_p63666683_game_squad_compariso.forum_topics(id),
  content text NOT NULL,
  author_id integer NOT NULL REFERENCES t_p63666683_game_squad_compariso.users(id),
  is_hidden boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);