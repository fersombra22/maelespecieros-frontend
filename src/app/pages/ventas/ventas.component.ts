import {
  Component,
  OnInit,
  inject,
  HostListener,
  ChangeDetectionStrategy,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ProductoService } from '../../core/services/producto.service';
import { VentaService } from '../../core/services/venta.service';
import { CarritoService, ProductoCarrito } from '../../core/services/carrito.service';
import { ClienteService } from '../../core/services/cliente.service';

import { Producto } from '../../core/models/producto';
import { Cliente } from '../../core/models/cliente';
import { VentaRequest } from '../../core/models/venta-request';
import Swal from 'sweetalert2';

const Toast = Swal.mixin({
  toast: true,
  position: 'bottom-end',
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  },
});

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VentasComponent implements OnInit {
  private productoService = inject(ProductoService);
  private ventaService = inject(VentaService);
  private clienteService = inject(ClienteService);
  public carritoService = inject(CarritoService); // Public to use its signals in template

  // Use Signals for local state to align with OnPush
  sugerencias = signal<Producto[]>([]);
  mostrarSugerencias = signal<boolean>(false);
  formaPago = signal<string>('EFECTIVO');
  descuento = signal<number>(0);
  buscar = signal<string>('');
  cargandoProductos = signal<boolean>(false);

  // Clientes
  clientesActivos = signal<Cliente[]>([]);
  clienteSeleccionadoId = signal<number | null>(null);

  // Search debounce timer
  private searchTimeout: any;

  // Modal Nuevo Cliente
  mostrarModalCliente = signal<boolean>(false);
  nuevoCliente = { nombre: '', apellido: '', telefono: '', email: '' };

  ngOnInit(): void {
    this.cargarClientesActivos();
  }

  cargarClientesActivos(): void {
    this.clienteService.listarActivos().subscribe({
      next: (res) => {
        if (res.data) {
          this.clientesActivos.set(res.data);
        }
      },
    });
  }

  // --- LOGICA MODAL NUEVO CLIENTE ---
  abrirModalNuevoCliente(): void {
    this.nuevoCliente = { nombre: '', apellido: '', telefono: '', email: '' };
    this.mostrarModalCliente.set(true);
  }

  cerrarModalCliente(): void {
    this.mostrarModalCliente.set(false);
  }

  guardarNuevoCliente(): void {
    if (!this.nuevoCliente.nombre || !this.nuevoCliente.apellido || !this.nuevoCliente.email) {
      Toast.fire({ icon: 'warning', title: 'Nombre, apellido y email son obligatorios' });
      return;
    }

    this.clienteService.crear(this.nuevoCliente).subscribe({
      next: (res) => {
        Toast.fire({ icon: 'success', title: 'Cliente creado correctamente' });
        this.cargarClientesActivos(); // Recargar la lista
        if (res.data && res.data.id) {
          this.clienteSeleccionadoId.set(res.data.id); // Seleccionarlo automáticamente
        }
        this.cerrarModalCliente();
      },
      error: () => {
        Swal.fire('Error', 'No se pudo crear el cliente', 'error');
      },
    });
  }
  // ----------------------------------

  // Hotkeys
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'F2') {
      event.preventDefault();
      document.getElementById('searchInput')?.focus();
    } else if (event.key === 'F4') {
      event.preventDefault();
      this.finalizarVenta();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.buscar.set('');
      this.onBuscarChange();
    }
  }

  cargarSugerencias(termino: string): void {
    this.cargandoProductos.set(true);
    this.productoService.buscarPorNombre(termino, 0, 10).subscribe({
      next: (response: any) => {
        if (response.data && response.data.content) {
          this.sugerencias.set(response.data.content);
        } else {
          this.sugerencias.set([]);
        }
        this.mostrarSugerencias.set(true);
        this.cargandoProductos.set(false);
      },
      error: () => {
        this.sugerencias.set([]);
        this.mostrarSugerencias.set(true);
        this.cargandoProductos.set(false);
      },
    });
  }

  onBuscarChange(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    const searchTerm = this.buscar().trim();
    if (!searchTerm) {
      this.sugerencias.set([]);
      this.mostrarSugerencias.set(false);
      return;
    }

    this.searchTimeout = setTimeout(() => {
      this.cargarSugerencias(searchTerm);
    }, 300);
  }

  seleccionarSugerencia(producto: Producto): void {
    if (producto.stock <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin stock',
        text: `El producto ${producto.nombre} no tiene stock disponible.`,
      });
      return;
    }
    const p = this.carritoService.carrito().find((x) => x.id === producto.id);
    if (p && p.cantidad >= producto.stock) {
      Toast.fire({ icon: 'warning', title: 'Límite de stock alcanzado' });
      return;
    }

    this.agregar(producto);
    this.buscar.set('');
    this.sugerencias.set([]);
    this.mostrarSugerencias.set(false);

    // Devolver foco al input
    setTimeout(() => {
      document.getElementById('searchInput')?.focus();
    }, 100);
  }

  ocultarSugerencias(): void {
    // Pequeño timeout para permitir que el click en la sugerencia se registre antes de ocultar
    setTimeout(() => {
      this.mostrarSugerencias.set(false);
    }, 200);
  }

  mostrarSugerenciasNuevamente(): void {
    if (this.sugerencias().length > 0) {
      this.mostrarSugerencias.set(true);
    }
  }

  agregar(producto: Producto): void {
    this.carritoService.agregar(producto);
    Toast.fire({
      icon: 'success',
      title: 'Producto agregado',
    });
  }

  aumentar(id: number): void {
    const p = this.carritoService.carrito().find((x) => x.id === id);
    if (p && p.cantidad >= p.stock) {
      Toast.fire({ icon: 'warning', title: 'Límite de stock alcanzado' });
      return;
    }
    this.carritoService.aumentarCantidad(id);
  }

  disminuir(id: number): void {
    this.carritoService.disminuirCantidad(id);
  }

  eliminar(id: number): void {
    this.carritoService.eliminar(id);
  }

  setCantidad(id: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = parseInt(input.value, 10);
    const p = this.carritoService.carrito().find((x) => x.id === id);

    if (p && !isNaN(value) && value > 0) {
      if (value > p.stock) {
        Toast.fire({ icon: 'warning', title: `Solo hay ${p.stock} en stock` });
        input.value = p.stock.toString();
        this.carritoService.actualizarCantidad(id, p.stock);
      } else {
        this.carritoService.actualizarCantidad(id, value);
      }
    } else {
      input.value = '1';
      this.carritoService.actualizarCantidad(id, 1);
    }
  }

  precioActual(producto: ProductoCarrito): number {
    if (this.formaPago() === 'DEBITO' || this.formaPago() === 'CREDITO') {
      return producto.precioEfectivo / 0.8;
    }
    return producto.precioEfectivo;
  }

  totalEfectivo(): number {
    return this.carritoService.total(); // Computed signal internally
  }

  total(): number {
    return this.carritoService
      .carrito()
      .reduce((total, producto) => total + this.precioActual(producto) * producto.cantidad, 0);
  }

  finalizarVenta(): void {
    const currentCart = this.carritoService.carrito();
    if (currentCart.length === 0) {
      Toast.fire({
        icon: 'warning',
        title: 'Debe agregar productos al carrito',
      });
      return;
    }

    const request: any = {
      // Using any temporarily as VentaRequest was modified to include clienteId in backend but maybe not frontend model yet, though we will fix it if needed. Actually let's just cast.
      clienteId: this.clienteSeleccionadoId(),
      formaPago: this.formaPago(),
      descuento: this.descuento(),
      detalles: currentCart.map((producto) => ({
        productoId: producto.id,
        cantidad: producto.cantidad,
      })),
    };

    this.ventaService.crear(request).subscribe({
      next: (response: any) => {
        Swal.fire({
          icon: 'success',
          title: 'Venta exitosa',
          text: 'La operación ha sido registrada.',
          showConfirmButton: true,
          confirmButtonText: '<i class="fa-solid fa-file-pdf"></i> Descargar Comprobante',
          showCancelButton: true,
          cancelButtonText: 'Nueva Venta',
        }).then((result) => {
          if (result.isConfirmed && response.data && response.data.id) {
            this.ventaService.generarComprobante(response.data.id);
          }
        });

        this.carritoService.limpiar();
        this.descuento.set(0);
        this.clienteSeleccionadoId.set(null);
        this.buscar.set('');
        this.sugerencias.set([]);
        this.mostrarSugerencias.set(false);
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ocurrió un problema al realizar la venta.',
        });
      },
    });
  }
}
