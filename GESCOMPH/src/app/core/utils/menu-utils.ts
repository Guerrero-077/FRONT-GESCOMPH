import { normalizeUrl } from './url-normalize';
import { BackendMenuItem } from '../layout/sidebar/sidebar.config';
import { User } from '../models/user.model';

export type MenuLike = readonly BackendMenuItem[] | User['menu'] | null | undefined;

function asMenuItems(menu: MenuLike): readonly BackendMenuItem[] {
  if (!menu || menu.length === 0) return [];
  return menu as readonly BackendMenuItem[];
}

export function buildNormalizedRouteSet(menu: MenuLike): Set<string> {
  const routes = new Set<string>();

  for (const mod of asMenuItems(menu)) {
    if (!mod?.forms?.length) continue;

    for (const form of mod.forms) {
      const route = normalizeUrl(form?.route);
      if (!route) continue;
      routes.add(route);
    }
  }

  return routes;
}

export function buildRoutePermissionIndex(menu: MenuLike): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();

  for (const mod of asMenuItems(menu)) {
    if (!mod?.forms?.length) continue;

    for (const form of mod.forms) {
      const route = normalizeUrl(form?.route);
      if (!route) continue;

      let bucket = map.get(route);
      if (!bucket) {
        bucket = new Set<string>();
        map.set(route, bucket);
      }

      for (const permission of form?.permissions ?? []) {
        bucket.add(permission);
      }
    }
  }

  return map;
}

export function hasRouteAccess(routes: Set<string>, targetUrl: string): boolean {
  const target = normalizeUrl(targetUrl);
  if (!target) return false;

  let candidate = target;
  while (true) {
    if (routes.has(candidate)) return true;
    const slashIndex = candidate.lastIndexOf('/');
    if (slashIndex === -1) break;
    candidate = candidate.slice(0, slashIndex);
  }

  return routes.has(candidate);
}