import {
  ApplicationConfig,
  LOCALE_ID,
  inject,
  provideAppInitializer,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { provideCloudinaryLoader } from '@angular/common';
import { authInterceptor } from './core/interceptors/auth/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error/error.interceptor';
import { ngrokCredentialsInterceptor } from './core/interceptors/security/ngrok-credentials.interceptor';
import { csrfInterceptor } from './core/interceptors/security/csrf.interceptor';

import { provideAnimations } from '@angular/platform-browser/animations'; // ✅ Versión estable Angular 20+
import { provideNativeDateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';

import { environment } from '../environments/environment';
import { SessionSyncService } from './core/services/auth/session-sync.service';
import localeEsCO from '@angular/common/locales/es-CO';
import { registerLocaleData } from '@angular/common';

registerLocaleData(localeEsCO);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    provideHttpClient(
      withFetch(),
      withInterceptors([
        csrfInterceptor,
        ...(environment.production ? [] : [ngrokCredentialsInterceptor]),
        errorInterceptor,
        authInterceptor,
      ]),
    ),

    provideAnimations(),

    provideNativeDateAdapter(),
    { provide: LOCALE_ID, useValue: 'es-CO' },
    { provide: MAT_DATE_LOCALE, useValue: 'es-CO' },
    provideCloudinaryLoader('https://res.cloudinary.com/dmbndpjlh/'),

    provideAppInitializer(async () => {
      const sessionSync = inject(SessionSyncService);
      await sessionSync.bootstrap();
    }),
  ],
};
