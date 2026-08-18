export const FLOWS_DIAGRAM = `flowchart LR
  FE["Frontend\nReact + Vite"]
  DB[("Supabase\nPostgres + RLS")]
  EDGE["Edge Function\nnogrod-api"]
  EXT["Integraciones externas\n(Claude Code, etc.)"]

  FE -->|"cliente Supabase\ncon tu sesion"| DB
  EXT -->|"api key\n(server-to-server)"| EDGE
  EDGE -->|"service role\n(bypassea RLS a proposito)"| DB
`

export const FLOW_SECTIONS = [
  {
    id: 'crear-item',
    title: 'Crear un item',
    description:
      'Desde el botón "+ Nuevo Item" completás el formulario y, al guardar, la app inserta la fila ' +
      'directo en Supabase usando tu sesión iniciada. La base le asigna sola un identificador único ' +
      '(como NOG-19) y lo asocia a tu usuario — no pasa por ningún servidor intermedio.',
  },
  {
    id: 'mover-item',
    title: 'Mover un item por el board',
    description:
      'Arrastrá una tarjeta y soltala sobre otra columna (Backlog, To Do, In Progress, In Review o ' +
      'Done) para cambiar su estado al instante — se guarda directo en la base. Si la soltás fuera de ' +
      'una columna válida o en la misma de origen, no pasa nada. Un clic normal (sin arrastrar) sigue ' +
      'abriendo el detalle del item, donde también podés cambiar el estado a mano.',
  },
  {
    id: 'login',
    title: 'Login',
    description:
      'Nogrod tiene un solo usuario dueño de todos los datos. Entrás con tu email y contraseña; ' +
      'mientras la sesión esté activa, la app te reconoce aunque recargués la página. Si cerrás sesión ' +
      'o todavía no iniciaste sesión, te manda directo a la pantalla de login, sea cual sea la URL a la ' +
      'que intentes entrar.',
  },
  {
    id: 'inbox-claude',
    title: 'Inbox de Claude',
    description:
      'Cuando Claude Code propone un item nuevo, te comparte un link a /inbox con los datos ya cargados. ' +
      'Ahí los revisás, los editás si hace falta, y al confirmar se crea el item de verdad en el board.',
  },
]
