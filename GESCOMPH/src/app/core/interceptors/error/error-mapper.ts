import { HttpErrorResponse } from '@angular/common/http';
import { AppError } from '../../models/app-error.model';
function resolveProblemMessage(error: HttpErrorResponse, fallback: string): string {
  const payload = error.error;
  if (payload && typeof payload === 'object') {
    const detail = typeof (payload as any).detail === 'string' ? (payload as any).detail.trim() : '';
    const title = typeof (payload as any).title === 'string' ? (payload as any).title.trim() : '';
    const message = typeof (payload as any).message === 'string' ? (payload as any).message.trim() : '';

    if (detail) return detail;
    if (title) return title;
    if (message) return message;
  }

  if (typeof payload === 'string') {
    const trimmed = payload.trim();
    if (trimmed) return trimmed;
  }

  return fallback;
}

export function mapHttpErrorToAppError(error: HttpErrorResponse): AppError {
  let message = 'Ocurrió un error inesperado';
  let type: AppError['type'] = 'Unexpected';

  if (error.status === 0) {
    type = 'Network';
    message = 'No hay conexión con el servidor. Verifica tu red.';
  } else if (error.status === 401) {
    type = 'Unauthorized';
    message = resolveProblemMessage(error, 'No autorizado. Debes iniciar sesión.');
  } else if (error.status === 403) {
    type = 'Forbidden';
    message = resolveProblemMessage(error, 'No tienes permisos para esta acción.');
  } else if (error.status === 404) {
    type = 'NotFound';
    message = resolveProblemMessage(error, 'Recurso no encontrado.');
  }
  // Validation ProblemDetails (RFC 7807)
  else if (
    (error.status === 400 || error.status === 422) &&
    error.error?.errors
  ) {
    type = 'Validation';
    // Asumimos formato ProblemDetails (RFC 7807)
    const firstKey = Object.keys(error.error.errors)[0];
    const firstMsg = error.error.errors[firstKey][0];
    message = firstMsg || 'Error de validación';
  }
  // Business/unprocessable
  else if (error.status === 422) {
    type = 'Business';
    message = resolveProblemMessage(error, 'Operación no válida.');
  } else if (error.status === 409) {
    type = 'Conflict';
    message = resolveProblemMessage(error, 'Conflicto al procesar la solicitud.');
  } else if (error.status === 429) {
    type = 'RateLimit';
    message = resolveProblemMessage(error, 'Demasiadas solicitudes. Intenta más tarde.');
  } else {
    message = resolveProblemMessage(error, message);
  }

  return { type, message, details: error.error };
}