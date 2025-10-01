import { Routes } from '@angular/router';
import { FinanceComponent } from './pages/finance-settings/finance.component';

export const FINANCE_ROUTES: Routes = [
    {
        path: '',
        component: FinanceComponent,
        title: 'Finanzas'
    }
];
