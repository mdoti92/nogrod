ALTER TABLE items
  ADD COLUMN IF NOT EXISTS execution_plan text,
  ADD COLUMN IF NOT EXISTS execution_summary text;
