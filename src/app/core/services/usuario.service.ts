import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response';
import { Usuario } from '../models/usuario';
import { UsuarioRequest } from '../models/usuario-request';
import { Page } from '../models/page';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/usuarios`;

  listar(page: number = 0, size: number = 10): Observable<ApiResponse<Page<Usuario>>> {
    let params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<Page<Usuario>>>(this.api, { params });
  }

  obtenerPorId(id: number): Observable<ApiResponse<Usuario>> {
    return this.http.get<ApiResponse<Usuario>>(`${this.api}/${id}`);
  }

  crear(request: UsuarioRequest): Observable<ApiResponse<Usuario>> {
    return this.http.post<ApiResponse<Usuario>>(this.api, request);
  }

  actualizar(id: number, request: UsuarioRequest): Observable<ApiResponse<Usuario>> {
    return this.http.put<ApiResponse<Usuario>>(`${this.api}/${id}`, request);
  }

  eliminar(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.api}/${id}`);
  }

  desbloquear(id: number): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.api}/${id}/desbloquear`, {});
  }
}
