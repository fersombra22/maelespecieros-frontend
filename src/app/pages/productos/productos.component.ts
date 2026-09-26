import {
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import Swal from 'sweetalert2';

import { ProductoService } from '../../core/services/producto.service';
import { Producto } from '../../core/models/producto';
import { AuthService } from '../../core/services/auth.service';
import { Rol } from '../../core/models/rol';

import { ProductoFormComponent } from '../../shared/components/producto-form/producto-form.component';

@Component({
  selector: 'app-productos',

  standalone: true,

  imports: [CommonModule, FormsModule, ProductoFormComponent],

  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductosComponent implements OnInit {
  private productoService = inject(ProductoService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  isAdmin: boolean = false;

  productos: Producto[] = [];
  textoBusqueda: string = '';
  mostrarModal: boolean = false;
  productoSeleccionado?: Producto;
  modoEdicion: boolean = false;
  cargando: boolean = false;
  seleccionados: Set<number> = new Set<number>();

  trackByFn(index: number, item: any): number {
    return item.id;
  }

  // Paginación
  currentPage: number = 0;
  pageSize: number = 10;
  totalElements: number = 0;
  totalPages: number = 0;

  ngOnInit(): void {
    const usuario = this.authService.obtenerUsuario();
    this.isAdmin = usuario?.rol === Rol.ADMIN || usuario?.rol === Rol.SUPER_ADMIN;
    this.cargarProductos();
  }

  toggleSeleccion(id: number): void {
    if (this.seleccionados.has(id)) {
      this.seleccionados.delete(id);
    } else {
      this.seleccionados.add(id);
    }
  }

  toggleTodos(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.productos.forEach((p) => this.seleccionados.add(p.id));
    } else {
      this.seleccionados.clear();
    }
  }

  calcularRentabilidad(producto: Producto): number {
    if (!producto.costo || producto.costo <= 0) return 100;
    return ((producto.precioEfectivo - producto.costo) / producto.costo) * 100;
  }

  exportarExcel(): void {
    this.productoService.exportarExcel().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `productos_${new Date().getTime()}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: () => {
        Swal.fire('Error', 'No se pudo exportar el Excel', 'error');
      },
    });
  }

  subirExcel(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.cargando = true;
      this.cdr.markForCheck();

      this.productoService.importarExcel(file).subscribe({
        next: () => {
          Swal.fire('¡Éxito!', 'Productos importados y actualizados correctamente.', 'success');
          this.currentPage = 0;
          this.cargarProductos();
          event.target.value = '';
        },
        error: (err) => {
          this.cargando = false;
          this.cdr.markForCheck();
          Swal.fire('Error', 'No se pudo importar el archivo Excel.', 'error');
          event.target.value = '';
        },
      });
    }
  }

  abrirAumentoMasivo(): void {
    if (this.seleccionados.size === 0) return;

    Swal.fire({
      title: 'Aumento Masivo de Precios',
      text: `Se aplicará el aumento a los ${this.seleccionados.size} productos seleccionados. (El costo no se modificará)`,
      input: 'number',
      inputLabel: 'Porcentaje de aumento (%)',
      inputPlaceholder: 'Ej: 15',
      showCancelButton: true,
      confirmButtonText: '<i class="fa-solid fa-percentage"></i> Aplicar Aumento',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value || parseFloat(value) <= 0) {
          return 'Debes ingresar un porcentaje mayor a 0';
        }
        return null;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const porcentaje = parseFloat(result.value);
        this.productoService.aumentoMasivo(Array.from(this.seleccionados), porcentaje).subscribe({
          next: () => {
            Swal.fire(
              '¡Éxito!',
              `Precios actualizados un ${porcentaje}%. El hash de integridad se ha regenerado correctamente.`,
              'success',
            );
            this.seleccionados.clear();
            this.cargarProductos();
          },
          error: () => {
            Swal.fire('Error', 'No se pudieron actualizar los precios', 'error');
          },
        });
      }
    });
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
    this.productoService
      .buscarPorNombre(this.textoBusqueda, this.currentPage, this.pageSize)
      .subscribe({
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
        },
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
