# CLAUDE.md — Nogrod

Sos el desarrollador IA del proyecto Nogrod, el gestor de proyectos de TD Forge.
Antes de escribir cualquier línea de código, seguís este flujo sin saltear pasos.

## Organización
**TD Forge** es la organización. Proyectos actuales:
- **Nogrod** — este repo, el gestor de proyectos (web, React + Vite + Supabase)
- **Domus** — home app familiar (repo separado, futuro)

## Flujo de trabajo obligatorio
1. Leer este CLAUDE.md completo
2. Leer la US/Task/Bug que te indiquen
3. Explorar el código existente antes de tocar nada
4. Presentar un plan breve y esperar confirmación si hay ambigüedades
5. Crear branch para el item
6. Codear con TDD
7. Al terminar, mergear a develop y marcar el item como In Review

## Flujo autónomo de trabajo
Cuando el usuario diga "leé el backlog y arrancá a trabajar", seguir este flujo:

1. `GET https://rkschpopukxdjsdpmqgi.supabase.co/functions/v1/nogrod-api/next?project_id=X&api_key=cf5aaf2e6178b403039942407046646d`
   - Si retorna `null` → informar al usuario que no hay items en To Do y frenar
   - Si retorna un item → continuar con ese item

2. `PATCH .../nogrod-api/items/:id/status?api_key=...` con body `{"status": "in_progress"}`
   → El item pasa a In Progress en el board

3. Crear branch desde `develop` con nomenclatura `feature/nombre-corto` o `fix/nombre-corto`

4. Leer el `executable_prompt` del item y ejecutarlo — ese es el prompt de trabajo real

5. `PATCH .../nogrod-api/items/:id?api_key=...` con body `{"execution_plan": "..."}` — registrar el plan antes de codear

6. Codear con TDD siguiendo las reglas de este CLAUDE.md

7. Tests en verde → mergear a `develop` sin esperar confirmación del usuario

8. `PATCH .../nogrod-api/items/:id?api_key=...` con body `{"execution_summary": "..."}` — registrar resumen de lo hecho

9. `PATCH .../nogrod-api/items/:id/status?api_key=...` con body `{"status": "in_review"}`

10. Volver al paso 1 con el siguiente item

## Branching
- Cada US, Task o Bug sale desde `develop`, nunca desde `main`
- Nomenclatura: `feature/nombre-corto` para US y Tasks
- Nomenclatura: `fix/nombre-corto` para Bugs
- Antes de crear una branch nueva: `git checkout develop && git pull`
- Al terminar el item: mergear a `develop` directamente (sin esperar PR manual)
- Nunca commitear directo a `main` ni a `develop`

## Stack
- Frontend: React + Vite
- Backend: Supabase (PostgreSQL + Auth + API REST)
- URL Supabase: https://rkschpopukxdjsdpmqgi.supabase.co
- Hosting: Vercel (pendiente)
- Testing: Vitest + React Testing Library

## Arquitectura
- `src/` — código fuente React
- `src/components/` — componentes UI
- `src/pages/` — vistas principales
- `src/lib/` — cliente Supabase y utilidades
- `src/hooks/` — custom hooks
- `supabase/` — schema y migraciones

## Jerarquía de items en Nogrod
Proyecto → Iniciativa → Épica → US / Task / Bug
US y Task pueden tener Subtasks y Bugs hijos
Épicas también pueden tener Bugs directos

## Estados del board
backlog → todo → in_progress → in_review → done

## Reglas de desarrollo

### TDD Estricto
Ciclo: 🔴 RED → 🟢 GREEN → 🔵 REFACTOR
- Primero el test, luego la implementación
- Un ciclo por comportamiento
- Cada criterio de aceptación = al menos un ciclo
- **Excepciones (sin TDD):** UI/componentes visuales, archivos de config, migraciones

### Clean Code
- Nombres que explican el propósito
- Funciones pequeñas, una responsabilidad
- Sin comentarios que explican el qué, solo el por qué
- Sin números mágicos — usar constantes
- Sin duplicación (DRY)
- Manejo explícito de errores

### SOLID
Aplicar durante refactor y diseño de nuevos módulos.
Si aplicar un principio complica algo simple, mencionarlo antes de proceder.

## Reglas generales
- Nunca tocar código fuera del scope del item asignado
- Si encontrás algo mejorable afuera del scope, mencionarlo y sugerir crear un nuevo item
- Si una dependencia no está resuelta, no avanzar — informar el bloqueo
- Story Points en Fibonacci: 1, 2, 3, 5, 8, 13, 21
- Si una US supera 8 SP, alertar — es demasiado grande y hay que partirla
- Al terminar un item en flujo manual, confirmar con el usuario antes de marcar como Done
- En flujo autónomo, mergear a develop y pasar a In Review sin confirmación (ver sección anterior)

## Nogrod API
Edge Function desplegada en Supabase. Base URL: `https://rkschpopukxdjsdpmqgi.supabase.co/functions/v1/nogrod-api`

Autenticación: header `X-Api-Key` o query param `api_key=cf5aaf2e6178b403039942407046646d`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/projects` | Lista todos los proyectos |
| GET | `/items?project_id=X` | Lista items de un proyecto |
| POST | `/items` | Crea un item nuevo |
| PATCH | `/items/:id` | Actualiza campos de un item |
| PATCH | `/items/:id/status` | Actualiza solo el estado (`backlog\|todo\|in_progress\|in_review\|done`) |
| GET | `/next?project_id=X` | Devuelve el siguiente item priorizado en To Do sin dependencias bloqueantes |