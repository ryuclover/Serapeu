/**
 * Sanitizador de texto contra XSS e injeção de HTML malicioso.
 * Remove ou escapa tags HTML perigosas e scripts em campos de texto livre.
 */
export function sanitizeText(input: string): string {
  if (!input) return ''

  return input
    // Substitui caracteres HTML especiais por entidades
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim()
}

/**
 * Sanitiza caminho relativo local contra Open Redirect (CWE-601).
 * Garante que a URL comece estritamente com / e não tenha barras duplas ou backslashes.
 */
export function sanitizeSafeLocalPath(path?: string | null): string {
  if (!path || typeof path !== 'string') return '/'
  const trimmed = path.trim()
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\')) {
    return '/'
  }
  return trimmed
}
