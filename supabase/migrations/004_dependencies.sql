CREATE TABLE IF NOT EXISTS dependencies (
  item_id       uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  depends_on_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  created_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (item_id, depends_on_id)
);

CREATE INDEX IF NOT EXISTS dependencies_item_id_idx ON dependencies(item_id);
CREATE INDEX IF NOT EXISTS dependencies_depends_on_id_idx ON dependencies(depends_on_id);
