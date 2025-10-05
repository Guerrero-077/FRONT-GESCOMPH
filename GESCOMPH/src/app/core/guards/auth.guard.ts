import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { of, map, catchError } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';
import { UserStore } from '../services/permission/User.Store';
import { normalizeUrl } from '../utils/url-normalize';
import { buildNormalizedRouteSet, hasRouteAccess } from '../utils/menu-utils';
import { User } from '../models/user.model';

export const authGuard: CanActivateFn = (
  _route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const router = inject(Router);
  const auth = inject(AuthService);
  const userStore = inject(UserStore);

  const can = (u: User | null): boolean | UrlTree => {
    if (!u?.menu?.length) return router.parseUrl('/auth/login');

    const allowed = buildNormalizedRouteSet(u.menu);
    const req = normalizeUrl(state.url);

    if (req === '' && allowed.has('dashboard')) return true;
    if (hasRouteAccess(allowed, req)) return true;

    return router.parseUrl(allowed.has('dashboard') ? '/dashboard' : '/auth/login');
  };

  return auth.GetMe().pipe(
    map(u => {
      if (!u) return router.parseUrl('/auth/login');
      userStore.set(u);
      return can(u);
    }),
    catchError(() => of(router.parseUrl('/auth/login')))
  );
};