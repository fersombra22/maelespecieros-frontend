import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response';
import { Page } from '../models/page';
import { Categoria } from '../models/categoria';
import { CategoriaRequest } from '../models/categoria-request';

@Injectable({
  providedIn: 'root',
})
export class CategoriaService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/categorias`;

  listar(page: number = 0, size: number = 10): Observable<ApiResponse<Page<Categoria>>> {
    let params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<Page<Categoria>>>(this.api, { params });
  }

  obtenerPorId(id: number): Observable<ApiResponse<Categoria>> {
    return this.http.get<ApiResponse<Categoria>>(`${this.api}/${id}`);
  }

  crear(categoria: CategoriaRequest): Observable<ApiResponse<Categoria>> {
    return this.http.post<ApiResponse<Categoria>>(
      this.api,

      categoria,
    );
  }

  actualizar(
    id: number,

    categoria: CategoriaRequest,
  ): Observable<ApiResponse<Categoria>> {
    return this.http.put<ApiResponse<Categoria>>(
      `${this.api}/${id}`,

      categoria,
    );
  }

  eliminar(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.api}/${id}`);
  }

  activar(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(
      `${this.api}/${id}/activar`,

      {},
    );
  }
}
