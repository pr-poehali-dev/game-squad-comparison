ALTER TABLE treaties ADD COLUMN IF NOT EXISTS stat_modifiers_ex JSONB NOT NULL DEFAULT '{}'::jsonb;
