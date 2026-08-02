// Next.js-style file-based routing for Vite
// Maps pathnames to page components loaded from src/app/

import type React from 'react'

export interface RouteDefinition {
  path: string
  component: React.LazyExoticComponent<React.ComponentType<unknown>>
  layout?: React.LazyExoticComponent<React.ComponentType<{ children: React.ReactNode }>>
}

export function matchRoute(
  pathname: string,
  routes: RouteDefinition[],
): { route: RouteDefinition; params: Record<string, string> } | null {
  for (const route of routes) {
    const pattern = route.path.replace(/\[(\w+)\]/g, ':$1')
    const regex = new RegExp(`^${pattern.replace(/:\w+/g, '([^/]+)')}$`)
    const match = pathname.match(regex)
    if (match) {
      const keys = [...route.path.matchAll(/\[(\w+)\]/g)].map((m) => m[1])
      const params: Record<string, string> = {}
      keys.forEach((key, i) => {
        params[key] = match[i + 1]
      })
      return { route, params }
    }
  }
  return null
}
