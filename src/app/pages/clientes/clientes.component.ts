import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import { ClienteService } from '../../core/services/cliente.service';
import { Cliente } from '../../core/models/cliente';
import { ClienteRequest } from '../../core/models/cliente-request';
import { ClienteFormComponent } from './cliente-form/cliente-form.component';
import { ClienteDetailComponent } from './cliente-detail/cliente-detail.component';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, ClienteFormComponent, ClienteDetailComponent],
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientesComponent implements OnInit {
  private clienteService = inject(ClienteService);
  private cdr = inject(ChangeDetectorRef);

  clientes: Cliente[] = [];
  cargando: boolean = true;

  // Búsqueda y Filtros
  busqueda: string = '';
  filtroActivo: boolean | null = null; // null = todos, true = activos, false = inactivos

  // Paginación
  currentPage: number = 0;
  pageSize: number = 10;
  totalElements: number = 0;
  totalPages: number = 0;

  // Modales
  mostrarModalFormulario: boolean = false;
  clienteEdicion?: Cliente;

  mostrarModalDetalle: boolean = false;
  clienteDetalle?: Cliente;

  // Estadísticas rápidas
  totalActivosCount: number = 0;
  totalInactivosCount: number = 0;

  ngOnInit(): void {
    this.cargar();
  }

  trackByFn(index: number, item: Cliente): number {
    return item.id;
  }

  cargar(): void {
    this.cargando = true;
    this.clienteService
      .listar(this.currentPage, this.pageSize, this.busqueda, this.filtroActivo ?? undefined)
      .subscribe({
        next: (response) => {
          if (response.data && response.data.content) {
            this.clientes = response.data.content;
            this.totalElements = response.data.totalElements;
            this.totalPages = response.data.totalPages;
          } else {
            this.clientes = [];
            this.totalElements = 0;
            this.totalPages = 0;
          }
          this.calcularEstadisticas();
          this.cargando = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.cargando = false;
          this.cdr.markForCheck();
          console.error('Error al cargar clientes:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error de conexión',
            text: 'No se pudieron recuperar los clientes. Verifique que el backend esté activo.',
          });
        },
      });
  }

  calcularEstadisticas(): void {
    // Si no hay filtro, podemos estimar sobre la página o cargar conteo
    this.totalActivosCount = this.clientes.filter((c) => c.activo).length;
    this.totalInactivosCount = this.clientes.filter((c) => !c.activo).length;
  }

  onBuscar(): void {
    this.currentPage = 0;
    this.cargar();
  }

  limpiarBusqueda(): void {
    this.busqueda = '';
    this.filtroActivo = null;
    this.currentPage = 0;
    this.cargar();
  }

  cambiarFiltroActivo(filtro: boolean | null): void {
    this.filtroActivo = filtro;
    this.currentPage = 0;
    this.cargar();
  }

  cambiarPagina(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.cargar();
    }
  }

  abrirNuevo(): void {
    this.clienteEdicion = undefined;
    this.mostrarModalFormulario = true;
    this.cdr.markForCheck();
  }

  abrirEditar(cliente: Cliente): void {
    this.clienteEdicion = { ...cliente };
    this.mostrarModalFormulario = true;
    this.cdr.markForCheck();
  }

  cerrarModalFormulario(): void {
    this.mostrarModalFormulario = false;
    this.clienteEdicion = undefined;
    this.cdr.markForCheck();
  }

  abrirDetalle(cliente: Cliente): void {
    this.clienteDetalle = cliente;
    this.mostrarModalDetalle = true;
    this.cdr.markForCheck();
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.clienteDetalle = undefined;
    this.cdr.markForCheck();
  }

  guardarCliente(request: ClienteRequest): void {
    if (this.clienteEdicion && this.clienteEdicion.id) {
      // Actualizar
      this.clienteService.actualizar(this.clienteEdicion.id, request).subscribe({
        next: (resp) => {
          Swal.fire({
            icon: 'success',
            title: 'Cliente actualizado',
            text: `Los datos de ${request.nombre} ${request.apellido} fueron actualizados.`,
            timer: 2000,
            showConfirmButton: false,
          });
          this.cerrarModalFormulario();
          if (this.mostrarModalDetalle && this.clienteDetalle?.id === this.clienteEdicion?.id) {
            this.clienteDetalle = resp.data;
          }
          this.cargar();
        },
        error: (error) => {
          const msg = error.error?.message || 'No se pudo actualizar el cliente.';
          Swal.fire({
            icon: 'error',
            title: 'Error al actualizar',
            text: msg,
          });
        },
      });
    } else {
      // Crear
      this.clienteService.crear(request).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Cliente registrado',
            text: `El cliente ${request.nombre} ${request.apellido} se registró con éxito.`,
            timer: 2000,
            showConfirmButton: false,
          });
          this.cerrarModalFormulario();
          this.currentPage = 0;
          this.cargar();
        },
        error: (error) => {
          const msg = error.error?.message || 'No se pudo registrar el cliente.';
          Swal.fire({
            icon: 'error',
            title: 'Error al registrar',
            text: msg,
          });
        },
      });
    }
  }

  toggleEstado(cliente: Cliente): void {
    const accion = cliente.activo ? 'desactivar' : 'activar';
    const titulo = cliente.activo ? '¿Desactivar cliente?' : '¿Activar cliente?';
    const texto = cliente.activo
      ? `El cliente ${cliente.nombre} ${cliente.apellido} quedará inactivo.`
      : `El cliente ${cliente.nombre} ${cliente.apellido} volverá a estar habilitado.`;

    Swal.fire({
      title: titulo,
      text: texto,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: cliente.activo ? '#ef4444' : '#10b981',
    }).then((res) => {
      if (res.isConfirmed) {
        const obs = cliente.activo
          ? this.clienteService.desactivar(cliente.id)
          : this.clienteService.activar(cliente.id);

        obs.subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: `Cliente ${accion === 'activar' ? 'activado' : 'desactivado'}`,
              timer: 1500,
              showConfirmButton: false,
            });
            if (this.mostrarModalDetalle && this.clienteDetalle?.id === cliente.id) {
              this.clienteDetalle = { ...cliente, activo: !cliente.activo };
            }
            this.cargar();
          },
          error: (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: error.error?.message || `No se pudo ${accion} el cliente.`,
            });
          },
        });
      }
    });
  }

  eliminarCliente(cliente: Cliente): void {
    Swal.fire({
      title: '¿Eliminar definitivamente?',
      text: `Se borrará el registro de ${cliente.nombre} ${cliente.apellido}. Esta acción no se puede deshacer.`,
      icon: 'error',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
    }).then((res) => {
      if (res.isConfirmed) {
        this.clienteService.eliminar(cliente.id).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Cliente eliminado',
              timer: 1500,
              showConfirmButton: false,
            });
            if (this.mostrarModalDetalle && this.clienteDetalle?.id === cliente.id) {
              this.cerrarModalDetalle();
            }
            this.cargar();
          },
          error: (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error al eliminar',
              text: error.error?.message || 'No se pudo eliminar el cliente.',
            });
          },
        });
      }
    });
  }

  getIniciales(cliente: Cliente): string {
    const n = cliente.nombre ? cliente.nombre.charAt(0) : '';
    const a = cliente.apellido ? cliente.apellido.charAt(0) : '';
    return (n + a).toUpperCase() || 'CL';
  }
}
