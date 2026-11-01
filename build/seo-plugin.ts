import type { Plugin } from 'vite'

/** Pages privées : à ne pas explorer (espace salon, suivis personnels par jeton). */
const DISALLOWED = [
  '/dashboard',
  '/agenda',
  '/activity',
  '/queue',
  '/services',
  '/clients',
  '/payments',
  '/users',
  '/settings',
  '/admin',
  '/rdv/',
  '/file/',
  '/arrivee/',
  '/forgot-password',
]

/** Pages publiques à proposer aux moteurs de recherche. */
const SITEMAP_PATHS = ['/', '/register']

/**
 * SEO au build :
 * - remplace __SITE_URL__ dans index.html par VITE_SITE_URL (URL publique, ex. https://exemple.ci) ;
 *   sans URL, les balises qui exigent une adresse absolue sont retirées ;
 * - génère robots.txt et, si l'URL est connue, sitemap.xml.
 */
export function seoPlugin(siteUrl: string | undefined): Plugin {
  const base = (siteUrl ?? '').replace(/\/$/, '')

  return {
    name: 'manyan-seo',
    transformIndexHtml(html) {
      if (base) return html.replaceAll('__SITE_URL__', base)
      return html
        .split('\n')
        .filter((line) => !/(canonical|og:url|og:image"|twitter:image).*__SITE_URL__/.test(line))
        .join('\n')
        .replaceAll('"url": "__SITE_URL__/",', '')
    },
    generateBundle() {
      const robots = [
        'User-agent: *',
        'Allow: /',
        ...DISALLOWED.map((path) => `Disallow: ${path}`),
        ...(base ? ['', `Sitemap: ${base}/sitemap.xml`] : []),
        '',
      ].join('\n')
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots })

      if (!base) return
      const today = new Date().toISOString().slice(0, 10)
      const urls = SITEMAP_PATHS.map(
        (path) => `  <url><loc>${base}${path}</loc><lastmod>${today}</lastmod></url>`,
      ).join('\n')
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      })
    },
  }
}
