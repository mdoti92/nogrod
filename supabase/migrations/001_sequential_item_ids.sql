-- Add sequential ID support to projects and items

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS prefix text,
  ADD COLUMN IF NOT EXISTS next_item_number integer NOT NULL DEFAULT 1;

ALTER TABLE items
  ADD COLUMN IF NOT EXISTS sequential_id integer,
  ADD COLUMN IF NOT EXISTS item_id text;

-- Auto-generate prefix from project name (first 3 alpha chars, uppercase)
CREATE OR REPLACE FUNCTION generate_project_prefix()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.prefix IS NULL THEN
    NEW.prefix := UPPER(SUBSTRING(REGEXP_REPLACE(NEW.name, '[^a-zA-Z]', '', 'g'), 1, 3));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER set_project_prefix
  BEFORE INSERT OR UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION generate_project_prefix();

-- Backfill prefix for existing projects
UPDATE projects
SET prefix = UPPER(SUBSTRING(REGEXP_REPLACE(name, '[^a-zA-Z]', '', 'g'), 1, 3))
WHERE prefix IS NULL;

-- Atomically claim the next sequential number for a project
-- Returns (seq_id, item_prefix) to be used when inserting a new item
CREATE OR REPLACE FUNCTION claim_next_item_id(p_project_id uuid)
RETURNS TABLE(seq_id integer, item_prefix text)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_seq integer;
  v_prefix text;
BEGIN
  UPDATE projects
  SET next_item_number = next_item_number + 1
  WHERE id = p_project_id
  RETURNING next_item_number - 1, prefix INTO v_seq, v_prefix;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Project not found: %', p_project_id;
  END IF;

  RETURN QUERY SELECT v_seq, v_prefix;
END;
$$;
