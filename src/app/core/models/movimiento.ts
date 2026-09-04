export interface Movimiento {
  id: number;

  codigoProducto: string;

  producto: string;

  tipoMovimiento: string;

  cantidad: number;

  stockAnterior: number;

  stockNuevo: number;

  motivo: string;

  fecha: string;
}
