import { Injectable, computed, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../models/user.model';
import { buildRoutePermissionIndex } from '../../utils/menu-utils';
import { normalizeUrl } from '../../utils/url-normalize';
import { SessionSyncService } from '../auth/session-sync.service';
import { BackendMenuItem } from '../../../layout/sidebar/sidebar.config';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private readonly session = inject(SessionSyncService);

  readonly menu = computed<BackendMenuItem[]>(() => this.session.user()?.menu ?? []);

  readonly routeToPerms = computed(() => buildRoutePermissionIndex(this.session.user()?.menu));

  readonly roleSet = computed(() => new Set(this.session.user()?.roles ?? []));

  readonly hydrated = this.session.hydrated;

  userHasRole(user: User, role: string): boolean {
    return (user.roles ?? []).includes(role);
  }

  userHasPermissionForRoute(user: User, permission: string, url: string): boolean {
    const route = normalizeUrl(url);
    const index = buildRoutePermissionIndex(user.menu);
    return index.get(route)?.has(permission) ?? false;
  }

  private get user(): User | null {
    return this.session.snapshot;
  }

  hasRole(role: string): boolean {
    return this.roleSet().has(role);
  }

  hasPermission(permission: string): boolean {
    for (const perms of this.routeToPerms().values()) {
      if (perms.has(permission)) return true;
    }
    return false;
  }

  hasPermissionForRoute(permission: string, url: string): boolean {
    const route = normalizeUrl(url);
    return this.routeToPerms().get(route)?.has(permission) ?? false;
  }

  hydrate(force = false): Observable<User | null> {
    return this.session.hydrate(force);
  }

  /**
   * @deprecated Prefer the reactive menu signal when possible.
   */
  getMenu(): BackendMenuItem[] {
    return this.user?.menu ?? [];
  }
}
