import { Component, inject, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';

import { CommonModule } from '@angular/common';

import { ReporteService } from '../../core/services/reporte.service';
import { VentaService } from '../../core/services/venta.service';

@Component({
  selector: 'app-reportes',

  standalone: true,

  imports: [CommonModule],

  templateUrl: './reportes.component.html',

  styleUrls: ['./reportes.component.css'],
  
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportesComponent implements OnInit {
  private reporteService = inject(ReporteService);
  private ventaService = inject(VentaService);
  private cdr = inject(ChangeDetectorRef);

  public periodoSeleccionado: string = 'MES';
  public comparacionData: any = null;
  public cargandoComparacion: boolean = false;

  ngOnInit(): void {
    this.cargarComparacion();
  }

  cargarComparacion(): void {
    this.cargandoComparacion = true;
    this.ventaService.compararVentas(this.periodoSeleccionado).subscribe({
      next: (res: any) => {
        if (res.data) {
          this.comparacionData = res.data;
        }
        this.cargandoComparacion = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando comparación', err);
        this.cargandoComparacion = false;
        this.cdr.markForCheck();
      }
    });
  }

  cambiarPeriodo(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.periodoSeleccionado = select.value;
    this.cargarComparacion();
  }

  imprimirComparacionPdf(): void {
    this.ventaService.descargarComparacionPdf(this.periodoSeleccionado);
  }

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
