-- El edge function nogrod-api sigue llamando claim_next_item_id explicitamente
-- antes de insertar (via service_role, que retiene EXECUTE post-NOG-9) y ya
-- manda sequential_id/item_id en el insert — este trigger no lo toca.
--
-- El frontend (NOG-12) ahora inserta items directo con el cliente Supabase
-- autenticado, que NO tiene EXECUTE sobre claim_next_item_id. Este trigger,
-- SECURITY DEFINER, reclama el numero atomicamente en su lugar cuando el
-- insert no trae sequential_id/item_id.

CREATE OR REPLACE FUNCTION public.assign_sequential_item_id()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_seq integer;
  v_prefix text;
BEGIN
  IF NEW.sequential_id IS NULL THEN
    SELECT seq_id, item_prefix INTO v_seq, v_prefix
    FROM public.claim_next_item_id(NEW.project_id);

    NEW.sequential_id := v_seq;
    NEW.item_id := v_prefix || '-' || v_seq;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER set_item_sequential_id
  BEFORE INSERT ON public.items
  FOR EACH ROW EXECUTE FUNCTION public.assign_sequential_item_id();

-- El trigger es la unica forma de invocarla; no debe quedar expuesta como RPC.
REVOKE EXECUTE ON FUNCTION public.assign_sequential_item_id() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.assign_sequential_item_id() FROM anon, authenticated;
