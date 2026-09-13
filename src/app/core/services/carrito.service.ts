import { Injectable, signal, computed } from '@angular/core';
import { Producto } from '../models/producto';

export interface ProductoCarrito extends Producto {
  cantidad: number;
}

@Injectable({
  providedIn: 'root',
})
export class CarritoService {
  // Estado reactivo usando Signals
  private carritoState = signal<ProductoCarrito[]>([]);

  // Computed signals derivadas del estado
  public carrito = computed(() => this.carritoState());
  
  public total = computed(() => {
    return this.carritoState().reduce(
      (acc, producto) => acc + producto.precioEfectivo * producto.cantidad,
      0
    );
  });

  public itemsCount = computed(() => {
    return this.carritoState().reduce(
      (acc, producto) => acc + producto.cantidad,
      0
    );
  });

  agregar(producto: Producto): void {
    this.carritoState.update(items => {
      const existe = items.find(p => p.id === producto.id);
      if (existe) {
        return items.map(p => p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p);
      }
      return [...items, { ...producto, cantidad: 1 }];
    });
  }

  obtener(): ProductoCarrito[] {
    return this.carritoState(); // Por compatibilidad o uso directo si se necesita imperativo
  }

  eliminar(id: number): void {
    this.carritoState.update(items => items.filter(p => p.id !== id));
  }

  aumentarCantidad(id: number): void {
    this.carritoState.update(items => 
      items.map(p => p.id === id ? { ...p, cantidad: p.cantidad + 1 } : p)
    );
  }

  disminuirCantidad(id: number): void {
    this.carritoState.update(items => 
      items.map(p => p.id === id && p.cantidad > 1 ? { ...p, cantidad: p.cantidad - 1 } : p)
    );
  }

  actualizarCantidad(id: number, cantidad: number): void {
    if (cantidad <= 0) return;
    this.carritoState.update(items =>
      items.map(p => p.id === id ? { ...p, cantidad } : p)
    );
  }

  limpiar(): void {
    this.carritoState.set([]);
  }
}
