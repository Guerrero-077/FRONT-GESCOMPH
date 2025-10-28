import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

export interface TimeSlot {
  time: string;
  label: string;
}

@Component({
  selector: 'app-calendar-selector',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './calendar-selector.component.html',
  styleUrl: './calendar-selector.component.css'
})
export class CalendarSelectorComponent {
  @Output() dateSelected = new EventEmitter<{ date: Date; time: string }>();

  selectedDate = new FormControl<Date | null>(null);
  selectedTime = new FormControl<string>('');

  // Días permitidos: martes (2), miércoles (3), jueves (4), viernes (5), sábado (6)
  allowedDays = [2, 3, 4, 5, 6];

  // Horarios disponibles
  timeSlots: TimeSlot[] = [
    // Mañana: 8:00 a 12:00
    { time: '08:00', label: '8:00 AM' },
    { time: '09:00', label: '9:00 AM' },
    { time: '10:00', label: '10:00 AM' },
    { time: '11:00', label: '11:00 AM' },
    { time: '12:00', label: '12:00 PM' },
    // Tarde: 2:00 a 5:00
    { time: '14:00', label: '2:00 PM' },
    { time: '15:00', label: '3:00 PM' },
    { time: '16:00', label: '4:00 PM' },
    { time: '17:00', label: '5:00 PM' }
  ];

  // Filtro para el datepicker - solo permite días específicos
  dateFilter = (date: Date | null): boolean => {
    if (!date) return false;
    const dayOfWeek = date.getDay();
    return this.allowedDays.includes(dayOfWeek);
  };

  onDateSelected(date: Date | null): void {
    if (date) {
      this.selectedDate.setValue(date);
      // Reset time when date changes
      this.selectedTime.setValue('');
    }
  }

  selectTime(time: string): void {
    this.selectedTime.setValue(time);
  }

  confirmSelection(): void {
    const date = this.selectedDate.value;
    const time = this.selectedTime.value;

    if (date && time) {
      this.dateSelected.emit({ date, time });
    }
  }

  // Método para validar si una fecha está permitida
  isDateAllowed(date: Date): boolean {
    const dayOfWeek = date.getDay();
    return this.allowedDays.includes(dayOfWeek);
  }

  // Método para obtener las horas disponibles
  getAvailableTimes(): TimeSlot[] {
    return this.timeSlots;
  }
}
