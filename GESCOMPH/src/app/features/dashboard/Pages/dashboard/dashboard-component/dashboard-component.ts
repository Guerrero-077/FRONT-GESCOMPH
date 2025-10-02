import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { ArcElement, Chart, DoughnutController, Legend, Tooltip } from 'chart.js';
import { take } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { CircleChartComponent } from "../../../../../shared/components/circle-chart/circle-chart.component";
import { LineChartComponent } from "../../../../../shared/components/line-chart/line-chart.component";
import { PageHeaderService } from '../../../../../shared/Services/PageHeader/page-header.service';
import { EstablishmentSelect } from '../../../../establishments/models/establishment.models';
import { EstablishmentService } from '../../../../establishments/services/establishment/establishment.service';
import { CardInfoComponent } from '../../../components/card-info/card-info.component';
import { SystemAlertComponent } from "../../../components/system-alert/system-alert.component";

import { HasRoleAndPermissionDirective } from '../../../../../core/security/directives/HasRoleAndPermission.directive';
import { ContractCard } from '../../../../contracts/models/contract.models';
import { ContractService } from '../../../../contracts/services/contract/contract.service';
import { DashboardService } from '../../../services/dashboard.service';
import { ObligationsRealtimeService } from '../../../../../core/realtime/obligation-realtime.service';
import { QuickActionComponent } from '../../../components/quick-action/quick-action.component';

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

@Component({
  selector: 'app-dashboard-component',
  standalone: true,
  imports: [
    CommonModule,
    CardInfoComponent,
    QuickActionComponent,
    CircleChartComponent,
    LineChartComponent,
    HasRoleAndPermissionDirective
  ],
  templateUrl: './dashboard-component.html',
  styleUrl: './dashboard-component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {

  private readonly pageHeaderService = inject(PageHeaderService);
  private readonly establishmentService = inject(EstablishmentService);
  private readonly contractService = inject(ContractService);
  private readonly dashboardService = inject(DashboardService);
  private readonly realtime = inject(ObligationsRealtimeService);

  private subRealtime?: Subscription;

  readonly establishments = signal<readonly EstablishmentSelect[]>([]);
  readonly contract = signal<readonly ContractCard[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  totalMonth: number = 0;
  totalDay: number = 0;

  // Derivados como en Establishment-list
  readonly activeEstablishment = computed(() =>
    this.establishments().filter(e => e.active).length
  );
  readonly inactiveEstablishment = computed(() =>
    this.establishments().filter(e => !e.active).length
  );
  readonly activeContract = computed(() =>
    this.contract().filter(e => e.active).length
  );
  readonly inactiveContract = computed(() =>
    this.contract().filter(e => !e.active).length
  );

  ngOnInit(): void {
    this.pageHeaderService.setPageHeader('Inicio', 'Página Principal - GESCOMPAH');
    this.loadEstablishments();
    this.loadContract();
    this.loadTotals();

    // 👇 Conexión a SignalR
    this.realtime.connect();

    // 👇 Suscripción al stream de tiempo real
    this.subRealtime = this.realtime.totals$.subscribe(totals => {
      if (!totals) return;
      this.totalDay = totals.totalDay;
      this.totalMonth = totals.totalMonth;
    });
  }

  ngOnDestroy(): void {
    this.realtime.disconnect();
    this.subRealtime?.unsubscribe();
  }

  private loadEstablishments(): void {
    this.loading.set(true);
    this.error.set(null);

    this.establishmentService.getAll().pipe(take(1)).subscribe({
      next: (list) => this.establishments.set(list),
      error: (err) => this.error.set(err?.message || 'Error al cargar establecimientos'),
      complete: () => this.loading.set(false),
    });
  }

  private loadContract(): void {
    this.loading.set(true);
    this.error.set(null);

    this.contractService.getAll().pipe(take(1)).subscribe({
      next: (list) => this.contract.set(list),
      error: (err) => this.error.set(err?.message || 'Error al cargar contratos'),
      complete: () => this.loading.set(false),
    });
  }

  private loadTotals(): void {
    // 👇 Carga inicial desde API
    this.dashboardService.getMonthlyObligations().pipe(take(1)).subscribe({
      next: (res: number) => this.totalMonth = res,
      error: (err) => console.error('Error cargando mensual', err)
    });

    this.dashboardService.getDayObligations().pipe(take(1)).subscribe({
      next: (res: number) => this.totalDay = res,
      error: (err) => console.error('Error cargando diario', err)
    });
  }
}
