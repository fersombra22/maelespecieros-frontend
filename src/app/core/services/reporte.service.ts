import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ReporteService {
  private http = inject(HttpClient);

  private api = `${environment.apiUrl}/reportes`;

  abrirReporteProductos(): void {
    this.descargarPdf(`${this.api}/productos/pdf`, 'productos.pdf');
  }

  abrirReporteVentas(): void {
    this.descargarPdf(`${this.api}/ventas/pdf`, 'ventas.pdf');
  }

  abrirReporteStock(): void {
    this.descargarPdf(`${this.api}/stock/pdf`, 'stock_bajo.pdf');
  }

  abrirReporteAuditoria(): void {
    this.descargarPdf(`${this.api}/auditoria/pdf`, 'auditoria.pdf');
  }

  private descargarPdf(url: string, nombre: string): void {
    this.http
      .get(url, {
        responseType: 'blob',
      })
      .subscribe({
        next: (archivo) => {
          const blob = new Blob([archivo], {
            type: 'application/pdf',
          });

          const urlArchivo = window.URL.createObjectURL(blob);

          window.open(urlArchivo, '_blank');
        },

        error: (error) => {
          console.error('Error generando reporte', error);
        },
      });
  }
}
