export interface Dashboard {
  totalProductos: number;

  productosActivos: number;

  productosStockBajo: number;

  totalVentas: number;

  totalFacturado: number;
  porcentajeVariacionMensual: number;
  topProductos: { nombre: string; cantidadVendida: number; totalGenerado: number }[];
  ventasPorMetodoPago: { formaPago: string; total: number }[];
}
