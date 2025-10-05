import { Injectable, computed } from '@angular/core';
import { BackendMenuItem } from '../../layout/sidebar/sidebar.config';
import { normalizeUrl } from '../../utils/url-normalize';
import { buildRoutePermissionIndex } from '../../utils/menu-utils';
import { UserStore } from './User.Store';
import { User } from '../../models/user.model';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  constructor(private readonly userStore: UserStore) { }

  // === Derivados reactivos ===================================================

  // Menu reactivo (para componentes)
  readonly menu = computed<BackendMenuItem[]>(() => this.userStore.user()?.menu ?? []);

  // Indices reactivos para consultas en O(1)
  readonly routeToPerms = computed(() => buildRoutePermissionIndex(this.userStore.user()?.menu));

  // 2) roles -> Set
  readonly roleSet = computed(() => new Set(this.userStore.user()?.roles ?? []));

  // === Funciones "puras" para guards (reciben User explicito) ================
  userHasRole(user: User, role: string): boolean {
    return (user.roles ?? []).includes(role);
  }

  userHasPermissionForRoute(user: User, permission: string, url: string): boolean {
    const route = normalizeUrl(url);
    const index = buildRoutePermissionIndex(user.menu);
    return index.get(route)?.has(permission) ?? false;
  }

  // === Conveniencia por snapshot (no reactivas) ==============================
  private get user(): User | null {
    return this.userStore.snapshot;
  }

  hasRole(role: string): boolean {
    return this.roleSet().has(role);
  }

  hasPermission(permission: string): boolean {
    // Busca permiso en cualquier ruta
    for (const perms of this.routeToPerms().values()) {
      if (perms.has(permission)) return true;
    }
    return false;
  }

  hasPermissionForRoute(permission: string, url: string): boolean {
    const route = normalizeUrl(url);
    return this.routeToPerms().get(route)?.has(permission) ?? false;
  }

  /**
   * @deprecated Prefer the reactive menu signal when possible.
   */
  getMenu(): BackendMenuItem[] {
    return this.user?.menu ?? [];
  }
}