import { inject } from '@angular/core';
import { CanMatchFn, Router, Route, UrlSegment } from '@angular/router';
import { of, map, catchError } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';
import { UserStore } from '../services/permission/User.Store';
import { normalizeUrl } from '../utils/url-normalize';
import { buildNormalizedRouteSet, hasRouteAccess } from '../utils/menu-utils';
import { User } from '../models/user.model';

export const permissionMatchGuard: CanMatchFn = (_route: Route, segments: UrlSegment[]) => {
  const router = inject(Router);
  const auth = inject(AuthService);
  const userStore = inject(UserStore);

  const full = normalizeUrl('/' + segments.map(s => s.path).join('/'));

  const can = (u: User | null): boolean => {
    if (!u?.menu?.length) return false;
    const allowed = buildNormalizedRouteSet(u.menu);
    return hasRouteAccess(allowed, full);
  };

  return auth.GetMe().pipe(
    map(u => {
      if (!u) return router.parseUrl('/auth/login');
      userStore.set(u);
      return can(u) || router.parseUrl('/auth/login');
    }),
    catchError(() => of(router.parseUrl('/auth/login')))
  );
};