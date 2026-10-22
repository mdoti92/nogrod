-- NOG-22: estado "paused" para items y épicas.
-- paused_from_status guarda el estado previo a la pausa para poder reanudar ahí.
-- Los items se van a pausar también por SQL directo, así que la consistencia
-- status/paused_from_status la garantiza la base con un check, no solo el front.
-- Ningún registro existente cambia: la columna nueva arranca null en todos, lo que
-- cumple el check porque ninguno está en 'paused'.

ALTER TABLE public.items ADD COLUMN paused_from_status text NULL;
ALTER TABLE public.epics ADD COLUMN paused_from_status text NULL;

ALTER TABLE public.items DROP CONSTRAINT items_status_check;
ALTER TABLE public.items ADD CONSTRAINT items_status_check
  CHECK (status IN ('backlog', 'todo', 'in_progress', 'in_review', 'done', 'paused'));

ALTER TABLE public.epics DROP CONSTRAINT epics_status_check;
ALTER TABLE public.epics ADD CONSTRAINT epics_status_check
  CHECK (status IN ('backlog', 'todo', 'in_progress', 'in_review', 'done', 'paused'));

-- Un CHECK que evalúa a null se considera satisfecho, así que cada comparación
-- tiene que ser null-safe: status es nullable (status null = no pausado, y no puede
-- tener estado previo) y el IN con paused_from_status null daría null.
ALTER TABLE public.items ADD CONSTRAINT items_paused_from_status_check
  CHECK (
    (status IS NOT DISTINCT FROM 'paused'
      AND paused_from_status IS NOT NULL
      AND paused_from_status IN ('backlog', 'todo', 'in_progress', 'in_review'))
    OR (status IS DISTINCT FROM 'paused' AND paused_from_status IS NULL)
  );

ALTER TABLE public.epics ADD CONSTRAINT epics_paused_from_status_check
  CHECK (
    (status IS NOT DISTINCT FROM 'paused'
      AND paused_from_status IS NOT NULL
      AND paused_from_status IN ('backlog', 'todo', 'in_progress', 'in_review'))
    OR (status IS DISTINCT FROM 'paused' AND paused_from_status IS NULL)
  );
