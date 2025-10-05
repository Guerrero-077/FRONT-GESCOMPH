import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SessionSyncService } from '../services/auth/session-sync.service';
import { normalizeUrl } from '../utils/url-normalize';
import { UserStore } from '../services/permission/User.Store';

export const publicGuard: CanActivateFn = (route, state) => {
  const userStore = inject(UserStore);
  const router = inject(Router);
  const sessionSync = inject(SessionSyncService);

  const url = normalizeUrl(state.url);
  if (url.startsWith('auth/password_reset')) {
    return true;
  }

  if (userStore.snapshot) {
    return router.parseUrl('/dashboard');
  }

  return sessionSync.hydrate().pipe(
    map(user => (user ? router.parseUrl('/dashboard') : true)),
    catchError(() => of(true))
  );
};
