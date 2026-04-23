CREATE TABLE IF NOT EXISTS traits (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT 'gray' CHECK (color IN ('green', 'gray', 'red')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
