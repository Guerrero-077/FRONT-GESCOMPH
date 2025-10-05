import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SessionSyncService } from '../services/auth/session-sync.service';
import { normalizeUrl } from '../utils/url-normalize';
import { buildNormalizedRouteSet, hasRouteAccess } from '../utils/menu-utils';
import { User } from '../models/user.model';

export const authGuard: CanActivateFn = (
  _route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const router = inject(Router);
  const sessionSync = inject(SessionSyncService);

  const canNavigate = (u: User): boolean | UrlTree => {
    if (!u?.menu?.length) return router.parseUrl('/auth/login');

    const allowed = buildNormalizedRouteSet(u.menu);
    const req = normalizeUrl(state.url);

    if (req === '' && allowed.has('dashboard')) return true;
    if (hasRouteAccess(allowed, req)) return true;

    return router.parseUrl(allowed.has('dashboard') ? '/dashboard' : '/auth/login');
  };

  return sessionSync.hydrate().pipe(
    map(user => {
      if (!user) return router.parseUrl('/auth/login');
      return canNavigate(user);
    }),
    catchError(() => of(router.parseUrl('/auth/login')))
  );
};