import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
// =====================================================
// RESPUESTA DE UN BLOQUE DE BLOCKCHAIN
// =====================================================

export interface BlockchainAuditResponse {
  id: number;

  uuid: string;

  fecha: string;

  usuario: string;

  accion: string;

  descripcion: string;

  hashAnterior: string;

  hashActual: string;

  version: string;

  algoritmo: string;

  nonce: number;

  firmaHmac: string;
}

// =====================================================
// RESPUESTA PAGINADA DE SPRING DATA
// =====================================================

export interface BlockchainPage {
  content: BlockchainAuditResponse[];

  totalPages: number;

  totalElements: number;

  size: number;

  number: number;

  numberOfElements: number;

  first: boolean;

  last: boolean;

  empty: boolean;
}

// =====================================================
// SERVICE
// =====================================================

@Injectable({
  providedIn: 'root',
})
export class BlockchainService {
  private http = inject(HttpClient);

  private url = 'http://localhost:8080/api/blockchain';

  // ===================================================
  // LISTAR BLOQUES
  // ===================================================

  listar(
    pagina: number = 0,
    cantidad: number = 5,
    usuario: string = '',
    accion: string = '',
  ): Observable<BlockchainPage> {
    let params = new HttpParams().set('page', pagina).set('size', cantidad);

    if (usuario) {
      params = params.set('usuario', usuario);
    }

    if (accion) {
      params = params.set('accion', accion);
    }

    return this.http.get<BlockchainPage>(this.url, {
      params,
    });
  }

  // ===================================================
  // VERIFICAR CADENA
  // ===================================================

  verificar(): Observable<boolean> {
    return this.http.get<boolean>(this.url + '/verificar');
  }
}
