import type { RouteLocationNormalized } from 'vue-router'
import { BRAND_NAME } from '@/lib/brand'

/**
 * SEO côté client : titre, description, indexation et URL canonique de chaque page.
 * Le nom du produit est centralisé ici (et dans index.html) pour un futur renommage.
 */
export const SITE_NAME = BRAND_NAME

export const DEFAULT_DESCRIPTION =
  'Réservation en ligne, arrivée par QR code et file d’attente pour les salons de coiffure en Côte d’Ivoire. Vos clients savent quand vient leur tour.'

/** URL publique du site (VITE_SITE_URL), sans barre finale ; vide en local. */
export const SITE_URL = ((import.meta.env.VITE_SITE_URL as string | undefined) ?? '').replace(/\/$/, '')

export interface RouteSeo {
  /** Titre de la page, sans le nom du produit (ajouté automatiquement). */
  title?: string
  description?: string
  /** false : la page ne doit pas apparaître dans les moteurs de recherche. */
  index?: boolean
}

declare module 'vue-router' {
  interface RouteMeta {
    seo?: RouteSeo
  }
}

function setMeta(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  element.content = content
}

function setCanonical(href: string | null) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!href) {
    link?.remove()
    return
  }
  if (!link) {
    link = document.createElement('link')
    link.rel = 'canonical'
    document.head.appendChild(link)
  }
  link.href = href
}

export function fullTitle(title?: string): string {
  return title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} : réservation et file d’attente pour salons de coiffure`
}

/** Applique titre, description, robots et canonique ; à appeler à chaque navigation. */
export function applySeo(seo: RouteSeo = {}, path = '/') {
  const title = fullTitle(seo.title)
  const description = seo.description ?? DEFAULT_DESCRIPTION
  const indexable = seo.index ?? false
  const url = SITE_URL ? `${SITE_URL}${path === '/' ? '/' : path}` : null

  document.title = title
  setMeta('name', 'description', description)
  setMeta('name', 'robots', indexable ? 'index, follow' : 'noindex, nofollow')
  setMeta('property', 'og:title', title)
  setMeta('property', 'og:description', description)
  setMeta('name', 'twitter:title', title)
  setMeta('name', 'twitter:description', description)
  if (url) setMeta('property', 'og:url', url)
  setCanonical(indexable ? url : null)
}

export function applyRouteSeo(route: RouteLocationNormalized) {
  // La page la plus profonde l'emporte (les layouts n'ont pas de seo).
  const seo = [...route.matched].reverse().find((record) => record.meta.seo)?.meta.seo
  applySeo(seo, route.path)
}
