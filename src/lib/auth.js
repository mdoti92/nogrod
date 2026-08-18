const GENERIC_ERROR_MESSAGE = 'No se pudo iniciar sesión. Intentá de nuevo.'

const KNOWN_ERROR_MESSAGES = {
  'Invalid login credentials': 'Email o contraseña incorrectos',
}

export function getAuthErrorMessage(error) {
  if (!error) return GENERIC_ERROR_MESSAGE
  return KNOWN_ERROR_MESSAGES[error.message] ?? GENERIC_ERROR_MESSAGE
}
