import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, OnInit, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize, take } from 'rxjs/operators';

import { StandardButtonComponent } from '../../../../shared/components/standard-button/standard-button.component';
import { AppointmentStore } from '../../services/appointment/appointment.store';
import { AppointmentService } from '../../services/appointment/appointment.service';
import { AppointmentSelect } from '../../models/appointment.models';

type ComputedStatus = 'SCHEDULED' | 'OVERDUE' | 'CLOSED';

@Component({
  selector: 'app-appointment-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    StandardButtonComponent,
  ],
  templateUrl: './appointment-detail-dialog.component.html',
  styleUrls: ['./appointment-detail-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentDetailDialogComponent implements OnInit {
  private readonly store = inject(AppointmentStore);
  private readonly svc = inject(AppointmentService);

  appointment: AppointmentSelect | null = null;
  loading = false;
  error: string | null = null;

  readonly appointmentsArray$ = this.store.appointmentsArray$;

  private static readonly STATUS_LABEL = {
    SCHEDULED: 'Programada',
    OVERDUE: 'Vencida',
    CLOSED: 'Cerrada',
  } as const;

  constructor(
    private readonly dialogRef: MatDialogRef<AppointmentDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: number }
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.loading = true;
    this.error = null;

    const id = this.data?.id;
    if (!id) {
      this.error = 'ID de cita no proporcionado';
      this.loading = false;
      return;
    }

    const fromStore = this.store.loadById(id);
    if (fromStore) {
      this.appointment = fromStore;
      this.loading = false;
      return;
    }

    this.svc.getById(id)
      .pipe(finalize(() => (this.loading = false)), take(1))
      .subscribe({
        next: (appointment) => {
          const current = this.store.loadById(appointment.id);
          this.appointment = current ?? appointment;
        },
        error: () => {
          this.error = 'No se pudo cargar el detalle de la cita.';
        },
      });
  }

  getComputedStatus(a: AppointmentSelect | null): ComputedStatus {
    if (!a || !a.active) return 'CLOSED';
    return new Date(a.dateTimeAssigned).getTime() < new Date().getTime() ? 'OVERDUE' : 'SCHEDULED';
  }

  getStatusText(status: ComputedStatus): string {
    return AppointmentDetailDialogComponent.STATUS_LABEL[status];
  }

  close(): void {
    this.dialogRef.close();
  }
}
