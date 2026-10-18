import {
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { VentaService } from '../../../core/services/venta.service';
import { Venta } from '../../../core/models/venta';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-historial-ventas',

  standalone: true,

  imports: [CommonModule, FormsModule],

  templateUrl: './historial-ventas.component.html',
  styleUrls: ['./historial-ventas.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistorialVentasComponent implements OnInit {
  private ventaService = inject(VentaService);
  private cdr = inject(ChangeDetectorRef);

  ventas: Venta[] = [];

  trackByFn(index: number, item: any): number {
    return item.id;
  }

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
        Swal.fire('Error', 'No se pudo cargar el historial.', 'error');
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
          Swal.fire('Error', 'No se encontró la venta.', 'warning');
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
    Swal.fire({
      title: '¿Desea anular esta venta?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, anular',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.ventaService.anular(id).subscribe({
          next: () => {
            Swal.fire('Anulada', 'Venta anulada correctamente.', 'success');
            this.cargarVentas();
          },
          error: () => {
            Swal.fire('Error', 'No se pudo anular la venta.', 'error');
          },
        });
      }
    });
  }

  descargarPdf(id: number): void {
    this.ventaService.generarComprobante(id);
  }
}
