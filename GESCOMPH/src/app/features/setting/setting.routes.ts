import { Routes } from '@angular/router';
import { MainSettingsComponent } from './pages/main-settings/main-settings.component';
import { ProfileSettingsComponent } from '../profile/pages/profile-settings/profile-settings.component';
import { LocationSettingsComponent } from '../location/pages/location-settings/location-settings.component';
import { FinanceComponent } from '../finance/pages/finance-settings/finance.component';

export const SETTING_ROUTES: Routes = [
  {
    path: 'main',
    component: MainSettingsComponent,
    title: 'Configuración',
    children: [
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
      {
        path: 'profile',
        component: ProfileSettingsComponent,
        title: 'Perfil de Usuario'
      },
      {
        path: 'location',
        component: LocationSettingsComponent,
        title: 'Ubicaciones'
      },
      {
        path: 'finances',
        component: FinanceComponent,
        title: 'Finanzas'

      }

    ]
  }
];
