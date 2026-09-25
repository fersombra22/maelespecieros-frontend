import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response';
import { Page } from '../models/page';
import { Cliente } from '../models/cliente';
import { ClienteRequest } from '../models/cliente-request';

@Injectable({
  providedIn: 'root',
})
export class ClienteService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/clientes`;

  listar(
    page: number = 0,
    size: number = 10,
    search?: string,
    activo?: boolean,
    sortBy: string = 'apellido',
    sortDir: string = 'asc'
  ): Observable<ApiResponse<Page<Cliente>>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    if (search && search.trim() !== '') {
      params = params.set('search', search.trim());
    }

    if (activo !== undefined && activo !== null) {
      params = params.set('activo', activo);
    }

    return this.http.get<ApiResponse<Page<Cliente>>>(this.api, { params });
  }

  listarActivos(): Observable<ApiResponse<Cliente[]>> {
    return this.http.get<ApiResponse<Cliente[]>>(`${this.api}/activos`);
  }

  obtenerPorId(id: number): Observable<ApiResponse<Cliente>> {
    return this.http.get<ApiResponse<Cliente>>(`${this.api}/${id}`);
  }

  crear(request: ClienteRequest): Observable<ApiResponse<Cliente>> {
    return this.http.post<ApiResponse<Cliente>>(this.api, request);
  }

  actualizar(id: number, request: ClienteRequest): Observable<ApiResponse<Cliente>> {
    return this.http.put<ApiResponse<Cliente>>(`${this.api}/${id}`, request);
  }

  desactivar(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.api}/${id}/desactivar`, {});
  }

  activar(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.api}/${id}/activar`, {});
  }

  eliminar(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.api}/${id}`);
  }
}
