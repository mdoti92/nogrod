-- Restringe el acceso a las 6 tablas a usuarios autenticados dueños de la fila,
-- dejando el modelo listo para multiusuario a futuro (una columna owner_id por
-- tabla en vez de heredar el dueño via joins).
--
-- El edge function nogrod-api sigue usando SUPABASE_SERVICE_ROLE_KEY, que
-- bypassea RLS a proposito (scope_out de NOG-8) — no se toca aca (NOG-9).

-- Fallback para inserts sin sesion (ej. desde el edge function via service_role,
-- donde auth.uid() es NULL): hoy hay un solo dueño, mdoti92@gmail.com.
CREATE OR REPLACE FUNCTION public.default_owner_id()
RETURNS uuid
LANGUAGE sql STABLE
SET search_path = ''
AS $$ SELECT '14678030-4340-4b44-9206-e3cffb28b6b3'::uuid $$;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['projects', 'initiatives', 'epics', 'items', 'acceptance_criteria', 'dependencies']
  LOOP
    EXECUTE format(
      'ALTER TABLE public.%I ADD COLUMN owner_id uuid REFERENCES auth.users(id) DEFAULT COALESCE(auth.uid(), public.default_owner_id())',
      t
    );
    EXECUTE format('UPDATE public.%I SET owner_id = public.default_owner_id() WHERE owner_id IS NULL', t);
    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN owner_id SET NOT NULL', t);
  END LOOP;
END $$;

DROP POLICY "allow all projects" ON public.projects;
DROP POLICY "allow all initiatives" ON public.initiatives;
DROP POLICY "allow all epics" ON public.epics;
DROP POLICY "allow all items" ON public.items;
DROP POLICY "allow all ac" ON public.acceptance_criteria;
DROP POLICY "allow all deps" ON public.dependencies;

CREATE POLICY "owner access" ON public.projects FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "owner access" ON public.initiatives FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "owner access" ON public.epics FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "owner access" ON public.items FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "owner access" ON public.acceptance_criteria FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "owner access" ON public.dependencies FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
