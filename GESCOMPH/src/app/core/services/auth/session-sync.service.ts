import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, firstValueFrom, of } from 'rxjs';
import { catchError, finalize, shareReplay, tap } from 'rxjs/operators';

import { User } from '../../models/user.model';
import { AuthEventsService } from './auth-events.service';
import { AuthService } from './auth.service';
import { UserStore } from '../permission/User.Store';

@Injectable({ providedIn: 'root' })
export class SessionSyncService {
  private readonly auth = inject(AuthService);
  private readonly userStore = inject(UserStore);
  private readonly authEvents = inject(AuthEventsService);
  private readonly destroyRef = inject(DestroyRef);

  private hydration$: Observable<User | null> | null = null;
  private readonly status = signal<'idle' | 'hydrating' | 'ready' | 'empty'>('idle');

  readonly user = this.userStore.user;
  readonly hydrated = computed(() => this.status() === 'ready');
  readonly sessionStatus = this.status.asReadonly();

  constructor() {
    this.authEvents.onEvents()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        if (event.type === 'LOGIN_SUCCESS' || event.type === 'REFRESH_SUCCESS') {
          this.hydrate(true)
            .pipe(catchError(() => of(null)))
            .subscribe({ error: () => void 0 });
          return;
        }

        if (event.type === 'LOGOUT') {
          this.hydration$ = null;
          this.status.set('empty');
          this.userStore.clear();
          return;
        }

        if (event.type === 'SESSION_EXPIRED') {
          this.hydration$ = null;
          this.status.set('empty');
          this.userStore.clear();
        }
      });
  }

  get snapshot(): User | null {
    return this.userStore.snapshot;
  }

  hydrate(force = false): Observable<User | null> {
    if (!force) {
      const existing = this.userStore.snapshot;
      if (existing) {
        this.status.set('ready');
        return of(existing);
      }

      if (!this.hydration$ && this.status() === 'empty') {
        return of(null);
      }

      if (this.hydration$) {
        return this.hydration$;
      }
    } else {
      this.hydration$ = null;
    }

    if (!this.hydration$) {
      this.status.set('hydrating');
      this.hydration$ = this.auth.GetMe().pipe(
        tap(() => {
          this.status.set('ready');
        }),
        catchError((err) => {
          if (err instanceof HttpErrorResponse && err.status === 401) {
            this.userStore.clear();
          }
          this.status.set('empty');
          return of(null);
        }),
        finalize(() => {
          this.hydration$ = null;
          if (!this.userStore.snapshot) {
            this.status.set('empty');
          }
        }),
        shareReplay(1)
      );
    }

    return this.hydration$;
  }

  async bootstrap(): Promise<void> {
    await firstValueFrom(
      this.hydrate().pipe(
        catchError(() => of(null))
      )
    );
  }
}
