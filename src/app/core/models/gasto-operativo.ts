export enum CategoriaGasto {
  PROVEEDORES = 'PROVEEDORES',
  SERVICIOS = 'SERVICIOS',
  INSUMOS = 'INSUMOS',
  RETIRO_SOCIO = 'RETIRO_SOCIO',
  MANTENIMIENTO = 'MANTENIMIENTO',
  VARIOS = 'VARIOS',
}

export const CategoriaGastoLabels: Record<CategoriaGasto, string> = {
  [CategoriaGasto.PROVEEDORES]: 'Proveedores',
  [CategoriaGasto.SERVICIOS]: 'Servicios e Impuestos',
  [CategoriaGasto.INSUMOS]: 'Insumos / Limpieza / Librería',
  [CategoriaGasto.RETIRO_SOCIO]: 'Retiro de Socio',
  [CategoriaGasto.MANTENIMIENTO]: 'Mantenimiento / Reparaciones',
  [CategoriaGasto.VARIOS]: 'Varios / Otros',
};

export interface GastoOperativo {
  id: number;
  monto: number;
  concepto: string;
  categoriaGasto: CategoriaGasto;
  formaPago: string;
  comprobanteNro?: string;
  fecha: string;
  anulado: boolean;
  cajaId?: number;
  usuarioId?: number;
  usuarioUsername?: string;
  usuarioNombreCompleto?: string;
}

export interface GastoOperativoRequest {
  monto: number;
  concepto: string;
  categoriaGasto: CategoriaGasto;
  formaPago: string;
  comprobanteNro?: string;
}
