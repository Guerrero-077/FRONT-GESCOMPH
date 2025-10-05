import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthEventsService } from './core/services/auth/auth-events.service';
import { SweetAlertService } from './shared/Services/sweet-alert/sweet-alert.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {
  private router = inject(Router);
  private authEvents = inject(AuthEventsService);
  private toast = inject(SweetAlertService);
  private destroyRef = inject(DestroyRef);
  protected title = 'FrontGESCOMPH';

  constructor() {
    this.listenAuthEvents();
  }

  private listenAuthEvents(): void {
    this.authEvents
      .onEvents()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        switch (event.type) {
          case 'SESSION_EXPIRED':
            this.handleSessionExpired();
            break;

          case 'LOGOUT':
            this.handleLogout();
            break;

          case 'LOGIN_SUCCESS':
            this.handleLoginSuccess();
            break;
        }
      });
  }

  private handleSessionExpired(): void {
    setTimeout(() => {
      void this.toast.error('Tu sesión ha expirado. Vuelve a iniciar sesión.', 'Sesión expirada');
    });
    this.router.navigate(['/auth/login']);
  }

  private handleLogout(): void {
    setTimeout(() => {
      void this.toast.success('Has cerrado sesión correctamente.', 'Sesión cerrada');
    });
    this.router.navigate(['/auth/login']);
  }

  private handleLoginSuccess(): void {
    setTimeout(() => {
      void this.toast.success('Inicio de sesión exitoso.', 'Bienvenido');
    });
  }
}
