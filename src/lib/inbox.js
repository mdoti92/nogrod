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

  const caList = searchParams.getAll('ca')
  if (caList.length > 0) item.acceptance_criteria = caList

  return item
}
