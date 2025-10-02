import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, tap, catchError, throwError } from "rxjs";
import { map } from "rxjs/operators";
import { AppointmentCreateModel, AppointmentSelect, AppointmentUpdateModel } from "../../models/appointment.models";
import { AppointmentService } from "./appointment.service";

@Injectable({ providedIn: 'root' })
export class AppointmentStore {
  private readonly _appointments = new BehaviorSubject<Map<number, AppointmentSelect>>(new Map());
  readonly appointments$ = this._appointments.asObservable();

  // Observable derivado que convierte el Map en un array
  readonly appointmentsArray$: Observable<AppointmentSelect[]> = this.appointments$.pipe(
    map(mapData => Array.from(mapData.values()))
  );

  constructor(private appointmentService: AppointmentService) {
    this.loadAll();
  }

  private get appointments(): Map<number, AppointmentSelect> {
    return this._appointments.getValue();
  }

  private set appointments(val: Map<number, AppointmentSelect>) {
    this._appointments.next(val);
  }

  loadAll(): void {
    this.appointmentService.getAll().pipe(
      tap(data => {
        const map = new Map<number, AppointmentSelect>();
        data.forEach(item => map.set(item.id, item));
        this.appointments = map;
      }),
      catchError(err => {
        console.error('Error loading appointments', err);
        return throwError(() => err);
      })
    ).subscribe();
  }

  loadById(id: number): AppointmentSelect | undefined {
    return this.appointments.get(id);
  }

  create(form: AppointmentCreateModel) {
    return this.appointmentService.create(form).pipe(
      tap(newAppt => {
        const updated = new Map(this.appointments);
        updated.set(newAppt.id, newAppt);
        this.appointments = updated;
      })
    );
  }

  update(id: number, dto: AppointmentUpdateModel) {
    return this.appointmentService.update(id, dto).pipe(
      tap(updatedAppt => {
        const updated = new Map(this.appointments);
        updated.set(id, updatedAppt);
        this.appointments = updated;
      })
    );
  }

  delete(id: number) {
    return this.appointmentService.delete(id).pipe(
      tap(() => {
        const updated = new Map(this.appointments);
        updated.delete(id);
        this.appointments = updated;
      })
    );
  }

  deleteLogic(id: number) {
    return this.appointmentService.deleteLogic(id).pipe(
      tap(() => this.loadAll())
    );
  }

  changeActiveStatus(id: number, active: boolean) {
    return this.appointmentService.changeActiveStatus(id, active).pipe(
      tap(updatedAppt => {
        const updated = new Map(this.appointments);
        updated.set(id, updatedAppt);
        this.appointments = updated;
      })
    );
  }
}
