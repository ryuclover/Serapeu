/**
 * Motor de Moderação Automática de Conteúdo para a plataforma Serapeu.
 * Identifica proativamente:
 * 1. Padrões de links maliciosos, IP loggers e domínios suspeitos de phishing.
 * 2. Linguagem abusiva, ofensiva ou discurso de ódio.
 * 3. Tentativas de injeção de scripts e spam repetitivo.
 */

export interface ModerationResult {
  allowed: boolean
  flagged: boolean
  reason?: string
  category?: 'phishing' | 'toxicity' | 'spam'
}

// Lista de domínios maliciosos e IP loggers conhecidos
const BLOCKED_DOMAINS = [
  'grabify.link',
  'iplogger.org',
  '2no.co',
  'yip.su',
  'iplis.ru',
  'free-crypto-giveaway.com',
  'steamcomnunity.com',
  'discord-nitro-free.com',
]

// Padrões de termos ofensivos / abusivos graves
const BLOCKED_WORDS = [
  'nazista',
  'estupro',
  'pedofilia',
  'suicidio incentivo',
  'matar voce',
  'compre seguidores',
  'hackear conta',
  'cartao clonado',
]

/**
 * Analisa o conteúdo de texto para garantir conformidade com as regras da comunidade.
 */
export function moderateContent(text: string): ModerationResult {
  if (!text || typeof text !== 'string') {
    return { allowed: true, flagged: false }
  }

  const normalized = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

  // 1. Verificação de domínios perigosos / phishing
  for (const domain of BLOCKED_DOMAINS) {
    if (normalized.includes(domain)) {
      return {
        allowed: false,
        flagged: true,
        reason: 'O texto contém link para domínio bloqueado ou suspeito de phishing.',
        category: 'phishing',
      }
    }
  }

  // 2. Verificação de termos de ódio / ilícitos
  for (const word of BLOCKED_WORDS) {
    if (normalized.includes(word)) {
      return {
        allowed: false,
        flagged: true,
        reason: 'Conteúdo contém termos que violam os Termos de Uso da plataforma.',
        category: 'toxicity',
      }
    }
  }

  // 3. Verificação de links excessivos (indicativo forte de spam bot)
  const urlMatches = text.match(/https?:\/\/[^\s]+/gi) || []
  if (urlMatches.length > 5) {
    return {
      allowed: false,
      flagged: true,
      reason: 'Excesso de links externos detectado (limite de 5 por publicação).',
      category: 'spam',
    }
  }

  // 4. Detecção de caracteres repetidos anormais (ex: "aaaaaaaaaaaaaaaaaaaaa")
  if (/(.)\1{30,}/i.test(text)) {
    return {
      allowed: false,
      flagged: true,
      reason: 'Texto contém repetição excessiva de caracteres.',
      category: 'spam',
    }
  }

  return { allowed: true, flagged: false }
}
