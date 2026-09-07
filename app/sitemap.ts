import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://serapeu.com'

  const routes = [
    '',
    '/perguntas',
    '/sobre',
    '/contato',
    '/termos',
    '/privacidade',
    '/regras',
    '/entrar',
    '/registrar',
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' || route === '/perguntas' ? 'daily' : 'monthly',
    priority: route === '' ? 1 : route === '/perguntas' ? 0.8 : 0.5,
  }))
}
