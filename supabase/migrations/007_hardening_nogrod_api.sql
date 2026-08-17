-- Hardening: fijar search_path en funciones señaladas por el linter de seguridad
-- de Supabase (function_search_path_mutable) y restringir quién puede ejecutar
-- claim_next_item_id vía RPC publica.

-- generate_project_prefix solo usa built-ins (UPPER/SUBSTRING/REGEXP_REPLACE, en
-- pg_catalog, siempre resuelto sin importar el search_path) y campos de NEW, asi
-- que puede correr con search_path vacio sin cambios en el cuerpo.
ALTER FUNCTION public.generate_project_prefix() SET search_path = '';

-- claim_next_item_id referenciaba `projects` sin calificar; con search_path = ''
-- hace falta calificarla como public.projects para que siga resolviendo.
CREATE OR REPLACE FUNCTION public.claim_next_item_id(p_project_id uuid)
RETURNS TABLE(seq_id integer, item_prefix text)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_seq integer;
  v_prefix text;
BEGIN
  UPDATE public.projects
  SET next_item_number = next_item_number + 1
  WHERE id = p_project_id
  RETURNING next_item_number - 1, prefix INTO v_seq, v_prefix;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Project not found: %', p_project_id;
  END IF;

  RETURN QUERY SELECT v_seq, v_prefix;
END;
$$;

-- claim_next_item_id es SECURITY DEFINER y solo la llama el edge function
-- nogrod-api (con SUPABASE_SERVICE_ROLE_KEY); no debe quedar expuesta como
-- RPC publica para los roles anon/authenticated.
REVOKE EXECUTE ON FUNCTION public.claim_next_item_id(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.claim_next_item_id(uuid) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_next_item_id(uuid) TO service_role;
