import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response';
import { Producto, ProductoRequest } from '../models/producto';
import { Page } from '../models/page';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductoService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/productos`;

  listar(page: number = 0, size: number = 10): Observable<ApiResponse<Page<Producto>>> {
    let params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<Page<Producto>>>(this.api, { params });
  }

  obtenerPorId(id: number): Observable<ApiResponse<Producto>> {
    return this.http.get<ApiResponse<Producto>>(`${this.api}/${id}`);
  }

  buscarPorCodigo(codigo: string): Observable<ApiResponse<Producto>> {
    return this.http.get<ApiResponse<Producto>>(`${this.api}/codigo/${codigo}`);
  }

  buscarPorNombre(nombre: string, page: number = 0, size: number = 10): Observable<ApiResponse<Page<Producto>>> {
    let params = new HttpParams().set('nombre', nombre).set('page', page).set('size', size);
    return this.http.get<ApiResponse<Page<Producto>>>(`${this.api}/buscar`, { params });
  }

  listarPorCategoria(categoriaId: number, page: number = 0, size: number = 10): Observable<ApiResponse<Page<Producto>>> {
    let params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<Page<Producto>>>(`${this.api}/categoria/${categoriaId}`, { params });
  }

  crear(producto: ProductoRequest): Observable<ApiResponse<Producto>> {
    return this.http.post<ApiResponse<Producto>>(
      this.api,

      producto,
    );
  }

  actualizar(
    id: number,

    producto: ProductoRequest,
  ): Observable<ApiResponse<Producto>> {
    return this.http.put<ApiResponse<Producto>>(
      `${this.api}/${id}`,

      producto,
    );
  }

  eliminar(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.api}/${id}`);
  }
}
