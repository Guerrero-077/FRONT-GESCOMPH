// src/app/core/service/realtime/obligations-realtime.service.ts
import { Injectable, inject, NgZone, ApplicationRef } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment';
import { BehaviorSubject } from 'rxjs';

type TotalsPayload = {
  totalDay: number;
  totalMonth: number;
};

@Injectable({ providedIn: 'root' })
export class ObligationsRealtimeService {
  private readonly zone = inject(NgZone);
  private readonly appRef = inject(ApplicationRef);
  private hub?: signalR.HubConnection;
  private handlersBound = false;

  // Estado reactivo para exponer al resto de la app
  private totalsSubject = new BehaviorSubject<TotalsPayload | null>(null);
  totals$ = this.totalsSubject.asObservable();

  connect(): void {
    if (this.hub) return;

    const hubUrl = `${environment.apiURL.replace(/\/$/, '')}/hubs/obligation`;

    this.hub = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, { withCredentials: true })
      .withAutomaticReconnect()
      .build();

    if (!this.handlersBound) {
      this.bindHandlers();
      this.handlersBound = true;
    }

    this.hub
      .start()
      .then(() => console.debug('[SignalR] Conectado a', hubUrl))
      .catch(err => console.error('[SignalR] Error de conexión', err));
  }

  disconnect(): void {
    this.hub?.stop().catch(() => void 0);
    this.hub = undefined;
    this.handlersBound = false;
  }

  // --- privados ---
  private bindHandlers(): void {
    // Escuchamos el evento enviado desde ObligationJobs
    this.hub!.on('ReceiveTotals', (payload: TotalsPayload) => {
      this.zone.run(() => {
        console.debug('[SignalR] Totales recibidos', payload);

        this.totalsSubject.next(payload);
        this.appRef.tick();
      });
    });

    this.hub!.onreconnected((_id) => {
      this.zone.run(() => {
        console.warn('[SignalR] Reconnected, esperando próximos eventos');
      });
    });

    this.hub!.onclose(err => {
      if (err) console.warn('[SignalR] Closed with error', err);
    });
  }
}
