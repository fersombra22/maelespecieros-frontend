import { Component, OnInit, inject, HostListener, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ProductoService } from '../../core/services/producto.service';
import { VentaService } from '../../core/services/venta.service';
import { CarritoService, ProductoCarrito } from '../../core/services/carrito.service';

import { Producto } from '../../core/models/producto';
import { VentaRequest } from '../../core/models/venta-request';
import Swal from 'sweetalert2';

const Toast = Swal.mixin({
  toast: true,
  position: 'bottom-end',
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  }
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
  public carritoService = inject(CarritoService); // Public to use its signals in template

  // Use Signals for local state to align with OnPush
  sugerencias = signal<Producto[]>([]);
  mostrarSugerencias = signal<boolean>(false);
  formaPago = signal<string>('EFECTIVO');
  descuento = signal<number>(0);
  buscar = signal<string>('');
  cargandoProductos = signal<boolean>(false);

  // Search debounce timer
  private searchTimeout: any;

  ngOnInit(): void {
    // Ya no cargamos todos los productos al inicio por defecto en este modelo POS
  }

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
      }
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
      title: 'Producto agregado'
    });
  }

  aumentar(id: number): void {
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
    if (!isNaN(value) && value > 0) {
      this.carritoService.actualizarCantidad(id, value);
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
    return this.carritoService.carrito().reduce(
      (total, producto) => total + this.precioActual(producto) * producto.cantidad,
      0
    );
  }

  finalizarVenta(): void {
    const currentCart = this.carritoService.carrito();
    if (currentCart.length === 0) {
      Toast.fire({
        icon: 'warning',
        title: 'Debe agregar productos al carrito'
      });
      return;
    }

    const request: VentaRequest = {
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
          cancelButtonText: 'Nueva Venta'
        }).then((result) => {
          if (result.isConfirmed && response.data && response.data.id) {
            this.ventaService.generarComprobante(response.data.id);
          }
        });

        this.carritoService.limpiar();
        this.descuento.set(0);
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
