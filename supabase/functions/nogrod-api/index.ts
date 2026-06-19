import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { validateApiKey } from './_lib/auth.ts'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, X-Api-Key',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  const apiKey = req.headers.get('X-Api-Key')
  if (!validateApiKey(apiKey, Deno.env.get('NOGROD_API_KEY'))) {
    return json({ error: 'Unauthorized' }, 401)
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const url = new URL(req.url)
  const path = url.pathname.replace(/^\/nogrod-api/, '')

  // GET /projects
  if (req.method === 'GET' && path === '/projects') {
    const { data, error } = await supabase.from('projects').select('*')
    if (error) return json({ error: error.message }, 500)
    return json(data)
  }

  // GET /items?project_id=X
  if (req.method === 'GET' && path === '/items') {
    const projectId = url.searchParams.get('project_id')
    let query = supabase.from('items').select('*').order('created_at', { ascending: false })
    if (projectId) query = query.eq('project_id', projectId)
    const { data, error } = await query
    if (error) return json({ error: error.message }, 500)
    return json(data)
  }

  // POST /items
  if (req.method === 'POST' && path === '/items') {
    const body = await req.json()
    const { data, error } = await supabase
      .from('items')
      .insert(body)
      .select()
      .single()
    if (error) return json({ error: error.message }, 400)
    return json(data, 201)
  }

  // PATCH /items/:id
  const patchMatch = path.match(/^\/items\/([^/]+)$/)
  if (req.method === 'PATCH' && patchMatch) {
    const id = patchMatch[1]
    const body = await req.json()
    const { data, error } = await supabase
      .from('items')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) return json({ error: error.message }, 400)
    return json(data)
  }

  return json({ error: 'Not Found' }, 404)
})

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  })
}
