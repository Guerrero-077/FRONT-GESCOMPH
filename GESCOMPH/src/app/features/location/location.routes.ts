import { Routes } from '@angular/router';
import { LocationSettingsComponent } from './pages/location-settings/location-settings.component';

export const LOCATION_ROUTES: Routes = [
    {
        path: '',
        component: LocationSettingsComponent,
        title: 'Ubicaciones'
    }
];
