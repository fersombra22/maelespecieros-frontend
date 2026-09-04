import { Component, inject } from '@angular/core';

import { CommonModule } from '@angular/common';

import { ReporteService } from '../../core/services/reporte.service';

@Component({
  selector: 'app-reportes',

  standalone: true,

  imports: [CommonModule],

  templateUrl: './reportes.component.html',

  styleUrls: ['./reportes.component.css'],
})
export class ReportesComponent {
  private reporteService = inject(ReporteService);

  productos(): void {
    this.reporteService.abrirReporteProductos();
  }

  ventas(): void {
    this.reporteService.abrirReporteVentas();
  }

  stock(): void {
    this.reporteService.abrirReporteStock();
  }

  auditoria(): void {
    this.reporteService.abrirReporteAuditoria();
  }
}
