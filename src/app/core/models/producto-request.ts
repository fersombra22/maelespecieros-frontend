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
