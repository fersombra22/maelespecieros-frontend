import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MovimientoService } from '../../core/services/movimiento.service';
import { ProductoService } from '../../core/services/producto.service';

import { Movimiento } from '../../core/models/movimiento';
import { Producto } from '../../core/models/producto';
import { MovimientoRequest } from '../../core/models/movimiento-request';

@Component({
  selector: 'app-movimientos',

  standalone: true,

  imports: [CommonModule, FormsModule],

  templateUrl: './movimientos.component.html',

  styleUrls: ['./movimientos.component.css'],
})
export class MovimientosComponent implements OnInit {
  private movimientoService = inject(MovimientoService);

  private productoService = inject(ProductoService);

  movimientos: Movimiento[] = [];

  productos: Producto[] = [];

  cargando: boolean = true;

  movimiento: MovimientoRequest = {
    productoId: 0,

    tipoMovimiento: 'ENTRADA',

    cantidad: 1,

    motivo: '',
  };

  paginaActual: number = 1;

  cantidadPorPagina: number = 10;

  totalPaginas: number = 0;

  totalRegistros: number = 0;

  ngOnInit(): void {
    this.cargarProductos();

    this.cargarMovimientos();
  }

  cargarProductos(): void {
    this.productoService.listar(0, 1000).subscribe({
      next: (response: any) => {
        if (response.data && response.data.content) {
          this.productos = response.data.content;
        } else {
          this.productos = [];
        }
      },
    });
  }

  cargarMovimientos(): void {
    this.cargando = true;

    this.movimientoService
      .listar(
        this.paginaActual - 1,

        this.cantidadPorPagina,
      )

      .subscribe({
        next: (response) => {
          this.movimientos = response.data.content;

          this.totalRegistros = response.data.totalElements;

          this.totalPaginas = response.data.totalPages;

          this.paginaActual = response.data.number + 1;

          this.cargando = false;
        },

        error: () => {
          this.cargando = false;

          alert('Error al cargar movimientos');
        },
      });
  }

  guardar(): void {
    if (this.movimiento.productoId === 0 || this.movimiento.cantidad <= 0) {
      alert('Complete los datos obligatorios');

      return;
    }

    this.movimientoService
      .crear(this.movimiento)

      .subscribe({
        next: () => {
          alert('Movimiento registrado correctamente');

          this.movimiento = {
            productoId: 0,

            tipoMovimiento: 'ENTRADA',

            cantidad: 1,

            motivo: '',
          };

          this.paginaActual = 1;

          this.cargarMovimientos();
        },

        error: () => {
          alert('Error al registrar movimiento');
        },
      });
  }

  paginaAnterior(): void {
    if (this.paginaActual > 1) {
      this.paginaActual--;

      this.cargarMovimientos();
    }
  }

  paginaSiguiente(): void {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;

      this.cargarMovimientos();
    }
  }

  irPrimeraPagina(): void {
    this.paginaActual = 1;

    this.cargarMovimientos();
  }

  irUltimaPagina(): void {
    this.paginaActual = this.totalPaginas;

    this.cargarMovimientos();
  }
}
