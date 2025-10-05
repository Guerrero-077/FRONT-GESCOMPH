import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AppError } from '../../models/app-error.model';
import { mapHttpErrorToAppError } from './error-mapper';
import { inject } from '@angular/core';
import { SweetAlertService } from '../../../shared/Services/sweet-alert/sweet-alert.service';

// Evita toasts duplicados para el mismo error (mismo traceId del backend)
const shownTraceIds = new Map<string, number>();
const DEDUP_WINDOW_MS = 30_000; // 30s

function shouldNotifyOnce(problem: any): boolean {
  try {
    const traceId: string | undefined = problem?.traceId;
    const now = Date.now();

    // Limpieza simple por ventana
    for (const [k, ts] of shownTraceIds) {
      if (now - ts > DEDUP_WINDOW_MS) shownTraceIds.delete(k);
    }

    if (!traceId) return true; // si no hay traceId, no deduplicamos
    if (shownTraceIds.has(traceId)) return false;
    shownTraceIds.set(traceId, now);
    return true;
  } catch {
    return true;
  }
}

export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const toast = inject(SweetAlertService);
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const appError: AppError = mapHttpErrorToAppError(error);
      const isLogin401 =
        error.status === 401 &&
        /\/auth\/login$/i.test(req.url.split('?')[0]);
      // Mostrar toast para errores de API, incluyendo 401 del login (resto lo maneja authInterceptor)
      if (error.status !== 401 || isLogin401) {
        // Mapear tipo a icono: Validation/Business => error
        const msg = appError.message || 'Ocurrió un error inesperado';

        // Evitar toasts en validaciones y 404 para no duplicar mensajes inline del formulario
        const suppressToast =
          appError.type === 'Validation' || error.status === 404;

        if (!suppressToast && shouldNotifyOnce(error?.error)) {
          // Programar el toast para que aparezca después de que se cierre el loader
          globalThis.setTimeout(() => {
            void toast.showNotification('Error', msg, 'error');
          }, 0);
        }
      }
      return throwError(() => appError);
    })
  );
};


