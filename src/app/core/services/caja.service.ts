import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response';
import { Page } from '../models/page';
import { AperturaCajaRequest, Caja, CierreCajaRequest, EstadoActualCaja } from '../models/caja';

@Injectable({
  providedIn: 'root',
})
export class CajaService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/caja`;

  obtenerEstadoActual(): Observable<ApiResponse<EstadoActualCaja>> {
    return this.http.get<ApiResponse<EstadoActualCaja>>(`${this.api}/estado-actual`);
  }

  abrir(request: AperturaCajaRequest): Observable<ApiResponse<Caja>> {
    return this.http.post<ApiResponse<Caja>>(`${this.api}/abrir`, request);
  }

  cerrar(request: CierreCajaRequest): Observable<ApiResponse<Caja>> {
    return this.http.post<ApiResponse<Caja>>(`${this.api}/cerrar`, request);
  }

  listarHistorial(page: number = 0, size: number = 10): Observable<ApiResponse<Page<Caja>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ApiResponse<Page<Caja>>>(`${this.api}/historial`, { params });
  }

  obtenerPorId(id: number): Observable<ApiResponse<Caja>> {
    return this.http.get<ApiResponse<Caja>>(`${this.api}/${id}`);
  }
}
