import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LoginModel } from '../../../features/auth-login/models/login.models';
import { RegisterModel } from '../../../features/auth-login/models/register.models';
import { ChangePasswordDto } from '../../models/ChangePassword.models';
import { User } from '../../models/user.model';
import { UserStore } from '../permission/User.Store';
import { AuthEventsService } from './auth-events.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private userStore = inject(UserStore);
  private authEvents = inject(AuthEventsService);

  private urlBase = environment.apiURL + '/auth/';

  Register(obj: RegisterModel): Observable<any> {
    return this.http.post<any>(this.urlBase + 'register', obj, { withCredentials: true });
  }

  Login(obj: LoginModel): Observable<void> {
    return this.http.post<void>(this.urlBase + 'login', obj, { withCredentials: true }).pipe(
      tap(() => this.authEvents.loginSuccess()),
      catchError((error) => {
        const detail = error?.error?.detail;
        if (detail) {
          error.error = { ...error.error, message: detail };
        }
        return throwError(() => error);
      })
    );
  }

  GetMe(): Observable<User> {
    return this.http.get<User>(this.urlBase + 'me', { withCredentials: true }).pipe(
      tap(user => this.userStore.set(user))
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(this.urlBase + 'logout', {}, { withCredentials: true }).pipe(
      tap(() => {
        this.userStore.clear();
        this.authEvents.logout();
        this.router.navigate(['/']);
      })
    );
  }

  RefreshToken(): Observable<void> {
    return this.http.post<void>(this.urlBase + 'refresh', {}, { withCredentials: true }).pipe(
      tap(() => this.authEvents.refreshSuccess())
    );
  }

  ChangePassword(dto: ChangePasswordDto): Observable<any> {
    return this.http.post(environment.apiURL + '/auth/change-password', dto, { withCredentials: true });
  }

  RequestPasswordReset(email: string): Observable<any> {
    const body = { email };
    return this.http.post(this.urlBase + 'recuperar/enviar-codigo', body);
  }

  ConfirmPasswordReset(params: { email: string; code: string; newPassword: string; }): Observable<any> {
    return this.http.post(this.urlBase + 'recuperar/confirmar', params);
  }
}
