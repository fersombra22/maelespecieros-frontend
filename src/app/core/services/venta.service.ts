import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response';
import { Venta } from '../models/venta';
import { Page } from '../models/page';

@Injectable({
  providedIn: 'root',
})
export class VentaService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/ventas`;

  listar(page: number = 0, size: number = 10): Observable<ApiResponse<Page<Venta>>> {
    let params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<Page<Venta>>>(this.api, { params });
  }

  obtenerPorId(id: number): Observable<ApiResponse<Venta>> {
    return this.http.get<ApiResponse<Venta>>(`${this.api}/${id}`);
  }

  obtenerPorNumero(numero: string): Observable<ApiResponse<Venta>> {
    return this.http.get<ApiResponse<Venta>>(`${this.api}/numero/${numero}`);
  }

  crear(venta: any): Observable<ApiResponse<Venta>> {
    return this.http.post<ApiResponse<Venta>>(this.api, venta);
  }

  anular(id: number): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.api}/${id}/anular`, {});
  }

  generarComprobante(id: number): void {
    this.http.get(`${this.api}/${id}/comprobante`, { responseType: 'blob' }).subscribe({
      next: (archivo) => {
        const blob = new Blob([archivo], { type: 'application/pdf' });
        const urlArchivo = window.URL.createObjectURL(blob);
        window.open(urlArchivo, '_blank');
      },
      error: (error) => {
        console.error('Error generando comprobante', error);
      },
    });
  }

  compararVentas(periodo: string): Observable<ApiResponse<any>> {
    let params = new HttpParams().set('periodo', periodo);
    return this.http.get<ApiResponse<any>>(`${this.api}/comparacion`, { params });
  }
}
