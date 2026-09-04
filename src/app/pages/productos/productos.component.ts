import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import Swal from 'sweetalert2';

import { ProductoService } from '../../core/services/producto.service';
import { Producto } from '../../core/models/producto';

import { ProductoFormComponent } from '../../shared/components/producto-form/producto-form.component';

@Component({
  selector: 'app-productos',

  standalone: true,

  imports: [CommonModule, FormsModule, ProductoFormComponent],

  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductosComponent implements OnInit {
  private productoService = inject(ProductoService);
  private cdr = inject(ChangeDetectorRef);

  productos: Producto[] = [];
  textoBusqueda: string = '';
  mostrarModal: boolean = false;
  productoSeleccionado?: Producto;
  modoEdicion: boolean = false;
  cargando: boolean = false;

  // Paginación
  currentPage: number = 0;
  pageSize: number = 10;
  totalElements: number = 0;
  totalPages: number = 0;

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.cargando = true;
    this.productoService.listar(this.currentPage, this.pageSize).subscribe({
      next: (response: any) => {
        if (response.data && response.data.content) {
          this.productos = response.data.content;
          this.totalElements = response.data.totalElements;
          this.totalPages = response.data.totalPages;
        } else {
          this.productos = [];
        }
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.cargando = false;
        this.cdr.markForCheck();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los productos.',
        });
      },
    });
  }

  buscar(): void {
    if (this.textoBusqueda.trim() === '') {
      this.currentPage = 0;
      this.cargarProductos();
      return;
    }

    this.cargando = true;
    this.productoService.buscarPorNombre(this.textoBusqueda, this.currentPage, this.pageSize).subscribe({
      next: (response: any) => {
        if (response.data && response.data.content) {
          this.productos = response.data.content;
          this.totalElements = response.data.totalElements;
          this.totalPages = response.data.totalPages;
        } else {
          this.productos = [];
        }
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.cargando = false;
        this.cdr.markForCheck();
      }
    });
  }

  cambiarPagina(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      if (this.textoBusqueda.trim() === '') {
        this.cargarProductos();
      } else {
        this.buscar();
      }
    }
  }

  nuevoProducto(): void {
    this.productoSeleccionado = undefined;

    this.modoEdicion = false;

    this.mostrarModal = true;
  }

  editar(producto: Producto): void {
    // Se envía una copia del objeto para evitar modificar
    // la tabla mientras se está editando.
    this.productoSeleccionado = { ...producto };

    this.modoEdicion = true;

    this.mostrarModal = true;
  }

  guardar(producto: any): void {
    if (this.modoEdicion && this.productoSeleccionado) {
      this.productoService
        .actualizar(
          this.productoSeleccionado.id,

          producto,
        )

        .subscribe({
          next: (response) => {
            // Primero cerramos el modal
            this.cerrarModal();

            // Luego actualizamos la tabla
            this.cargarProductos();

            // Finalmente mostramos el mensaje
            Swal.fire({
              icon: 'success',

              title: 'Producto actualizado',

              text: response.message,

              timer: 1200,

              showConfirmButton: false,
            });
          },

          error: () => {
            Swal.fire({
              icon: 'error',

              title: 'Error',

              text: 'No se pudo actualizar el producto.',
            });
          },
        });
    } else {
      this.productoService
        .crear(producto)

        .subscribe({
          next: (response) => {
            this.cerrarModal();
            this.currentPage = 0; // Reset to first page on create
            this.cargarProductos();
            Swal.fire({
              icon: 'success',
              title: 'Producto creado',
              text: response.message,
              timer: 1200,
              showConfirmButton: false,
            });
          },

          error: () => {
            Swal.fire({
              icon: 'error',

              title: 'Error',

              text: 'No se pudo crear el producto.',
            });
          },
        });
    }
  }

  eliminar(producto: Producto): void {
    Swal.fire({
      title: '¿Desactivar producto?',

      text: `Se desactivará ${producto.nombre}`,

      icon: 'warning',

      showCancelButton: true,

      confirmButtonText: 'Sí, desactivar',

      cancelButtonText: 'Cancelar',
    })

      .then((resultado) => {
        if (resultado.isConfirmed) {
          this.productoService
            .eliminar(producto.id)

            .subscribe({
              next: () => {
                Swal.fire({
                  icon: 'success',

                  title: 'Producto desactivado',

                  timer: 1200,

                  showConfirmButton: false,
                });

                this.cargarProductos();
              },
              error: () => {
                Swal.fire({
                  icon: 'error',

                  title: 'Error',

                  text: 'No se pudo desactivar el producto.',
                });
              },
            });
        }
      });
  }

  cerrarModal(): void {
    this.mostrarModal = false;

    this.productoSeleccionado = undefined;

    this.modoEdicion = false;
  }
}
