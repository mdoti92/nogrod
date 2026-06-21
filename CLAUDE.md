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
7. Al terminar, abrir PR a main y confirmar con el usuario

## Branching
- Cada US, Task o Bug sale desde `develop`, nunca desde `main`
- Nomenclatura: `feature/nombre-corto` para US y Tasks
- Nomenclatura: `fix/nombre-corto` para Bugs
- Antes de crear una branch nueva: `git checkout develop && git pull`
- Al terminar el item se abre un PR a `develop`
- Nunca commitear directo a `main` ni a `develop`
- El merge de `develop` a `main` lo decide el usuario manualmente

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
- Al terminar, confirmar con el usuario antes de marcar el item como Done y mergear el PR