-- ============================================
-- NOGROD - TD Forge Project Manager
-- Schema para Supabase
-- ============================================

-- Proyectos
create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  color text default '#C9A84C',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Iniciativas
create table initiatives (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  title text not null,
  description text,
  status text default 'active' check (status in ('active', 'completed', 'archived')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Épicas
create table epics (
  id uuid primary key default gen_random_uuid(),
  initiative_id uuid references initiatives(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  title text not null,
  description text,
  status text default 'backlog' check (status in ('backlog', 'todo', 'in_progress', 'in_review', 'done')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Items (US, Task, Bug, Subtask)
create table items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  epic_id uuid references epics(id) on delete set null,
  parent_id uuid references items(id) on delete cascade, -- para subtasks y bugs hijos
  type text not null check (type in ('us', 'task', 'bug', 'subtask')),
  title text not null,
  context text,        -- contexto / descripción
  stack text,          -- stack tecnológico involucrado
  scope_out text,      -- qué NO hace
  story_points integer check (story_points in (1,2,3,5,8,13,21)),
  status text default 'backlog' check (status in ('backlog', 'todo', 'in_progress', 'in_review', 'done')),
  priority text default 'medium' check (priority in ('low', 'medium', 'high', 'critical')),
  severity text check (severity in ('low', 'medium', 'high', 'critical')), -- solo bugs
  -- comportamiento actual/esperado para bugs
  actual_behavior text,
  expected_behavior text,
  reproduction_steps text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Criterios de Aceptación
create table acceptance_criteria (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references items(id) on delete cascade,
  description text not null, -- "Dado X → cuando Y → entonces Z"
  done boolean default false,
  order_index integer default 0,
  created_at timestamptz default now()
);

-- Dependencias entre items
create table dependencies (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references items(id) on delete cascade,       -- item que depende
  depends_on_id uuid references items(id) on delete cascade, -- item del que depende
  created_at timestamptz default now(),
  unique(item_id, depends_on_id)
);

-- Habilitar RLS (Row Level Security) - por ahora permisivo para desarrollo
alter table projects enable row level security;
alter table initiatives enable row level security;
alter table epics enable row level security;
alter table items enable row level security;
alter table acceptance_criteria enable row level security;
alter table dependencies enable row level security;

-- Políticas permisivas para desarrollo (ajustar cuando haya auth)
create policy "allow all projects" on projects for all using (true);
create policy "allow all initiatives" on initiatives for all using (true);
create policy "allow all epics" on epics for all using (true);
create policy "allow all items" on items for all using (true);
create policy "allow all ac" on acceptance_criteria for all using (true);
create policy "allow all deps" on dependencies for all using (true);

-- Datos iniciales: proyecto Nogrod
insert into projects (id, name, description, color) values 
  ('00000000-0000-0000-0000-000000000001', 'Nogrod', 'Gestor de proyectos de TD Forge', '#C9A84C'),
  ('00000000-0000-0000-0000-000000000002', 'Domus', 'Home app familiar', '#4C7BC9');