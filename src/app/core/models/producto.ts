export interface ProductoRequest {
  nombre: string;

  descripcion: string;

  modelo: string;

  precioEfectivo: number;

  costo: number;

  stock: number;

  stockMinimo: number;

  categoriaId: number;
}

export interface Producto {
  id: number;

  codigoProducto: string;

  nombre: string;

  descripcion: string;

  modelo: string;

  precioEfectivo: number;

  costo: number;

  stock: number;

  stockMinimo: number;

  categoriaId: number;

  categoria: string;

  activo: boolean;
}
