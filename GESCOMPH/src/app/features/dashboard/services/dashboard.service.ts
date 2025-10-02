import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly http = inject(HttpClient);
  private urlBase = environment.apiURL + '/obligation-months';

  getMonthlyObligations() {
    return this.http.get<number>(this.urlBase + '/TotalMonth', { withCredentials: true });
  }

  getDayObligations() {
    return this.http.get<number>(this.urlBase + '/TotalDay', { withCredentials: true });
  }
}
