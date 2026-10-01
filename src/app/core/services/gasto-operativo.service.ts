import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response';
import { Page } from '../models/page';
import { GastoOperativo, GastoOperativoRequest } from '../models/gasto-operativo';

@Injectable({
  providedIn: 'root',
})
export class GastoOperativoService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/gastos`;

  registrar(request: GastoOperativoRequest): Observable<ApiResponse<GastoOperativo>> {
    return this.http.post<ApiResponse<GastoOperativo>>(this.api, request);
  }

  listarPorCajaActual(): Observable<ApiResponse<GastoOperativo[]>> {
    return this.http.get<ApiResponse<GastoOperativo[]>>(`${this.api}/caja-actual`);
  }

  listarPorCaja(cajaId: number): Observable<ApiResponse<GastoOperativo[]>> {
    return this.http.get<ApiResponse<GastoOperativo[]>>(`${this.api}/caja/${cajaId}`);
  }

  listarHistorial(page: number = 0, size: number = 10): Observable<ApiResponse<Page<GastoOperativo>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ApiResponse<Page<GastoOperativo>>>(this.api, { params });
  }

  obtenerPorId(id: number): Observable<ApiResponse<GastoOperativo>> {
    return this.http.get<ApiResponse<GastoOperativo>>(`${this.api}/${id}`);
  }

  anular(id: number): Observable<ApiResponse<GastoOperativo>> {
    return this.http.delete<ApiResponse<GastoOperativo>>(`${this.api}/${id}`);
  }
}
