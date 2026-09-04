import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

import { ApiResponse } from '../models/api-response';
import { Auditoria } from '../models/auditoria';

@Injectable({
  providedIn: 'root',
})
export class AuditoriaService {
  private http = inject(HttpClient);

  private api = `${environment.apiUrl}/auditoria`;

  listar(): Observable<ApiResponse<Auditoria[]>> {
    return this.http.get<ApiResponse<Auditoria[]>>(this.api);
  }
}
