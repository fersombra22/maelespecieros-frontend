import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { VentaService } from '../../../core/services/venta.service';
import { Venta } from '../../../core/models/venta';

@Component({
  selector: 'app-historial-ventas',

  standalone: true,

  imports: [CommonModule, FormsModule],

  templateUrl: './historial-ventas.component.html',
  styleUrls: ['./historial-ventas.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HistorialVentasComponent implements OnInit {
  private ventaService = inject(VentaService);
  private cdr = inject(ChangeDetectorRef);

  ventas: Venta[] = [];

  cargando = true;
  numeroBusqueda: string = '';
  ventaSeleccionada?: Venta;
  mostrarDetalle: boolean = false;

  // Paginacion
  currentPage: number = 0;
  pageSize: number = 10;
  totalElements: number = 0;
  totalPages: number = 0;

  ngOnInit(): void {
    this.cargarVentas();
  }

  cargarVentas(): void {
    this.cargando = true;
    this.ventaService.listar(this.currentPage, this.pageSize).subscribe({
      next: (response: any) => {
        if (response.data && response.data.content) {
          this.ventas = response.data.content;
          this.totalElements = response.data.totalElements;
          this.totalPages = response.data.totalPages;
        } else {
          this.ventas = [];
        }
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.cargando = false;
        this.cdr.markForCheck();
        alert('No se pudo cargar el historial.');
      },
    });
  }

  cambiarPagina(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      if (this.numeroBusqueda.trim() === '') {
        this.cargarVentas();
      }
    }
  }

  buscarVenta(): void {
    if (this.numeroBusqueda.trim() === '') {
      this.cargarVentas();

      return;
    }

    this.cargando = true;

    this.ventaService
      .obtenerPorNumero(this.numeroBusqueda)

      .subscribe({
        next: (response) => {
          this.ventas = [response.data];
          this.cargando = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.ventas = [];
          this.cargando = false;
          this.cdr.markForCheck();
          alert('No se encontró la venta.');
        },
      });
  }

  limpiarBusqueda(): void {
    this.numeroBusqueda = '';

    this.cargarVentas();
  }

  verDetalle(venta: Venta): void {
    this.ventaSeleccionada = venta;

    this.mostrarDetalle = true;
  }

  cerrarDetalle(): void {
    this.ventaSeleccionada = undefined;

    this.mostrarDetalle = false;
  }

  anular(id: number): void {
    const confirmar = confirm('¿Desea anular esta venta?');
    if (!confirmar) {
      return;
    }
    this.ventaService.anular(id).subscribe({
      next: () => {
        alert('Venta anulada correctamente.');
        this.cargarVentas();
      },
      error: () => {
        alert('No se pudo anular la venta.');
      },
    });
  }

  descargarPdf(id: number): void {
    this.ventaService.generarComprobante(id);
  }
}
