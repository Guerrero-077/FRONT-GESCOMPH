import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthEventsService } from './core/services/auth/auth-events.service';
import { SweetAlertService } from './shared/Services/sweet-alert/sweet-alert.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  standalone: true,
  providers: [],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  router = inject(Router);
  private authEvents: AuthEventsService = inject(AuthEventsService);
  private toast: SweetAlertService = inject(SweetAlertService);
  protected title = 'FrontGESCOMPH';

  constructor() {
    // Listener global: ante expiración, login y logout mostrar mensaje y llevar a login cuando aplique
    this.authEvents.onEvents().subscribe((ev) => {
      if (ev.type === 'SESSION_EXPIRED') {
        globalThis.setTimeout(() => {
          void this.toast.error('Tu sesión ha expirado. Vuelve a iniciar sesión.', 'Sesión expirada');
        }, 0);
        this.router.navigate(['/auth/login']);
        return;
      }

      if (ev.type === 'LOGOUT') {
        globalThis.setTimeout(() => {
          void this.toast.success('Has cerrado sesión correctamente.', 'Sesión cerrada');
        }, 0);
        this.router.navigate(['/auth/login']);
        return;
      }

      if (ev.type === 'LOGIN_SUCCESS') {
        globalThis.setTimeout(() => {
          void this.toast.success('Inicio de sesión exitoso.', 'Bienvenido');
        }, 0);
      }
    });
  }
}


