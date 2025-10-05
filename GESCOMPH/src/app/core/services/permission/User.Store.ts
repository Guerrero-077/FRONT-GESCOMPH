import { Injectable, signal } from '@angular/core';
import { User } from '../../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserStore {
  // Fuente de verdad en memoria (RAM)
  private readonly _user = signal<User | null>(null);

  // Exposición solo-lectura (evita mutaciones accidentales desde afuera)
  readonly user = this._user.asReadonly();

  set(user: User | null): void {
    this._user.set(user);
  }

  clear(): void {
    this._user.set(null);
  }

  // Lectura "no reactiva" (no crea dependencias con Signals)
  get snapshot(): User | null {
    return this._user();
  }
}
