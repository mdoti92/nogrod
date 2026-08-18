CREATE TABLE IF NOT EXISTS acceptance_criteria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  description text NOT NULL,
  done boolean NOT NULL DEFAULT false,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS acceptance_criteria_item_id_idx ON acceptance_criteria(item_id);
