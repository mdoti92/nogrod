const REQUIRED_FIELDS = ['type', 'title', 'project_id']

export function parseInboxParams(searchParams) {
  for (const field of REQUIRED_FIELDS) {
    if (!searchParams.get(field)) return null
  }

  const item = {
    type: searchParams.get('type'),
    title: searchParams.get('title'),
    project_id: searchParams.get('project_id'),
    status: 'backlog',
  }

  const sp = searchParams.get('sp')
  if (sp) item.story_points = parseInt(sp, 10)

  const priority = searchParams.get('priority')
  if (priority) item.priority = priority

  const context = searchParams.get('context')
  if (context) item.context = context

  const scopeOut = searchParams.get('scope_out')
  if (scopeOut) item.scope_out = scopeOut

  const caList = searchParams.getAll('ca').flatMap(v => v.split('|')).filter(Boolean)
  if (caList.length > 0) item.acceptance_criteria = caList

  const prompt = searchParams.get('prompt')
  if (prompt) item.executable_prompt = prompt

  const depList = searchParams.getAll('dep')
  if (depList.length > 0) item.dependencies = depList

  return item
}
