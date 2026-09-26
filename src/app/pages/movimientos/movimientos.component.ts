import { Component, OnInit, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MovimientoService } from '../../core/services/movimiento.service';
import { ProductoService } from '../../core/services/producto.service';

import { Movimiento } from '../../core/models/movimiento';
import { Producto } from '../../core/models/producto';
import { MovimientoRequest } from '../../core/models/movimiento-request';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-movimientos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './movimientos.component.html',
  styleUrls: ['./movimientos.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovimientosComponent implements OnInit {
  private movimientoService = inject(MovimientoService);
  private productoService = inject(ProductoService);

  movimientos = signal<Movimiento[]>([]);
  productos = signal<Producto[]>([]);
  cargando = signal<boolean>(true);

  movimiento: MovimientoRequest = {
    productoId: 0,
    tipoMovimiento: 'ENTRADA',
    cantidad: 1,
    motivo: '',
  };

  paginaActual = signal<number>(1);
  cantidadPorPagina = signal<number>(10);
  totalPaginas = signal<number>(0);
  totalRegistros = signal<number>(0);

  ngOnInit(): void {
    this.cargarProductos();

    this.cargarMovimientos();
  }

  cargarProductos(): void {
    this.productoService.listar(0, 1000).subscribe({
      next: (response: any) => {
        if (response.data && response.data.content) {
          this.productos.set(response.data.content);
        } else {
          this.productos.set([]);
        }
      },
    });
  }

  cargarMovimientos(): void {
    this.cargando.set(true);

    this.movimientoService.listar(this.paginaActual() - 1, this.cantidadPorPagina()).subscribe({
      next: (response) => {
        this.movimientos.set(response.data.content);
        this.totalRegistros.set(response.data.totalElements);
        this.totalPaginas.set(response.data.totalPages);
        this.paginaActual.set(response.data.number + 1);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        Swal.fire('Error', 'Error al cargar movimientos', 'error');
      },
    });
  }

  guardar(): void {
    if (this.movimiento.productoId === 0 || this.movimiento.cantidad <= 0) {
      Swal.fire('Atención', 'Complete los datos obligatorios', 'warning');
      return;
    }

    this.movimientoService.crear(this.movimiento).subscribe({
      next: () => {
        Swal.fire('Registrado', 'Movimiento registrado correctamente', 'success');
        this.movimiento = {
          productoId: 0,
          tipoMovimiento: 'ENTRADA',
          cantidad: 1,
          motivo: '',
        };

        this.paginaActual.set(1);
        this.cargarMovimientos();
      },
      error: () => {
        Swal.fire('Error', 'Error al registrar movimiento', 'error');
      },
    });
  }

  paginaAnterior(): void {
    if (this.paginaActual() > 1) {
      this.paginaActual.update((p) => p - 1);
      this.cargarMovimientos();
    }
  }

  paginaSiguiente(): void {
    if (this.paginaActual() < this.totalPaginas()) {
      this.paginaActual.update((p) => p + 1);
      this.cargarMovimientos();
    }
  }

  irPrimeraPagina(): void {
    this.paginaActual.set(1);
    this.cargarMovimientos();
  }

  irUltimaPagina(): void {
    this.paginaActual.set(this.totalPaginas());
    this.cargarMovimientos();
  }
}
