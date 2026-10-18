import { Injectable, inject } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

import { ApiResponse } from '../models/api-response';

import { Dashboard } from '../models/dashboard';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);

  private api = `${environment.apiUrl}/dashboard`;

  obtenerDashboard(): Observable<ApiResponse<Dashboard>> {
    return this.http.get<ApiResponse<Dashboard>>(this.api);
  }

  obtenerInsights(): Observable<ApiResponse<{ insight: string; systemAltered: boolean }>> {
    return this.http.get<ApiResponse<{ insight: string; systemAltered: boolean }>>(
      `${environment.apiUrl}/ai/insights`,
    );
  }

  askChat(message: string): Observable<ApiResponse<{ reply: string }>> {
    return this.http.post<ApiResponse<{ reply: string }>>(`${environment.apiUrl}/ai/chat`, {
      message,
    });
  }
}
