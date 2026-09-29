export enum EstadoCaja {
  ABIERTA = 'ABIERTA',
  CERRADA = 'CERRADA'
}

export interface Caja {
  id: number;
  montoInicial: number;
  montoFinal?: number;
  montoVentas: number;
  diferencia?: number;
  fechaApertura: string;
  fechaCierre?: string;
  estado: EstadoCaja;
  observaciones?: string;
  usuarioId?: number;
  usuarioUsername?: string;
  usuarioNombreCompleto?: string;
}

export interface AperturaCajaRequest {
  montoInicial: number;
  observaciones?: string;
}

export interface CierreCajaRequest {
  montoFinal: number;
  observaciones?: string;
}

export interface EstadoActualCaja {
  abierta: boolean;
  caja?: Caja;
  montoVentasActual: number;
  montoEsperadoActual: number;
}
