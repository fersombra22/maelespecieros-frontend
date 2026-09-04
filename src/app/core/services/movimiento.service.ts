import { Injectable, inject } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

import { ApiResponse } from '../models/api-response';

import { Movimiento } from '../models/movimiento';

import { MovimientoRequest } from '../models/movimiento-request';

import { Page } from '../models/page';

@Injectable({
  providedIn: 'root',
})
export class MovimientoService {
  private http = inject(HttpClient);

  private api = `${environment.apiUrl}/movimientos`;

  listar(
    pagina: number,

    cantidad: number,
  ): Observable<ApiResponse<Page<Movimiento>>> {
    return this.http.get<ApiResponse<Page<Movimiento>>>(
      `${this.api}?pagina=${pagina}&cantidad=${cantidad}`,
    );
  }

  crear(request: MovimientoRequest): Observable<ApiResponse<Movimiento>> {
    return this.http.post<ApiResponse<Movimiento>>(
      this.api,

      request,
    );
  }

  listarPorProducto(
    productoId: number,

    pagina: number,

    cantidad: number,
  ): Observable<ApiResponse<Page<Movimiento>>> {
    return this.http.get<ApiResponse<Page<Movimiento>>>(
      `${this.api}/producto/${productoId}?pagina=${pagina}&cantidad=${cantidad}`,
    );
  }
}
