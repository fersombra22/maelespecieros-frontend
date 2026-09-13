import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlockchainService, BlockchainAuditResponse } from '../../core/services/blockchain.service';

interface AnomaliaAuditoriaResponse {
  entidad: string;
  identificador: string;
  camposAfectados: string;
  mecanismoSeguridad: string;
  tipoAnomalia: string;
  descripcion: string;
}

@Component({
  selector: 'app-blockchain',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './blockchain.component.html',
  styleUrls: ['./blockchain.component.css'],
})
export class BlockchainComponent implements OnInit {
  private service = inject(BlockchainService);

  bloques: BlockchainAuditResponse[] = [];
  anomalias: AnomaliaAuditoriaResponse[] = [];

  valida: boolean = false;
  mensaje: string = '';
  pagina: number = 0;
  totalPaginas: number = 0;
  cargando: boolean = false;

  // Variable para controlar el modal de autopsia forense
  bloqueSeleccionado: BlockchainAuditResponse | null = null;

  // ===================================================
  // INICIO
  // ===================================================

  ngOnInit(): void {
    this.cargar();
  }

  // ===================================================
  // CARGAR BLOQUES
  // ===================================================

  cargar(): void {
    this.cargando = true;

    this.service.listar(this.pagina).subscribe({
      next: (resp) => {
        this.bloques = resp.content;
        this.totalPaginas = resp.totalPages;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error cargando blockchain:', error);
        this.bloques = [];
        this.totalPaginas = 0;
        this.cargando = false;
      },
    });
  }

  // ===================================================
  // VERIFICAR CADENA
  // ===================================================

  verificarCadena(): void {
    this.service.verificar().subscribe({
      next: (resp: any) => {
        // Determinamos la validez de forma robusta
        if (typeof resp === 'boolean') {
          this.valida = resp;
        } else if (resp && resp.data !== undefined) {
          if (typeof resp.data === 'boolean') {
            this.valida = resp.data;
          } else if (resp.data && typeof resp.data.valida === 'boolean') {
            this.valida = resp.data.valida;
          } else {
            this.valida = true;
          }
        } else if (resp && typeof resp.valida === 'boolean') {
          this.valida = resp.valida;
        } else {
          this.valida = true;
        }

        // Extraer anomalías
        if (resp && resp.data && Array.isArray(resp.data.anomalias)) {
          this.anomalias = resp.data.anomalias;
        } else if (resp && Array.isArray(resp.anomalias)) {
          this.anomalias = resp.anomalias;
        } else {
          this.anomalias = [];
        }

        if (this.valida) {
          this.mensaje = 'La cadena blockchain es válida.';
        } else {
          this.mensaje = 'La cadena blockchain presenta inconsistencias.';
        }
      },
      error: (error) => {
        console.error('Error verificando blockchain:', error);
        this.valida = false;
        this.anomalias = [];
        this.mensaje = 'No se pudo verificar la cadena blockchain.';
      },
    });
  }

  // ===================================================
  // MÉTODOS PARA EL MODAL DE DETALLES (AUTOPSIA)
  // ===================================================

  verDetalles(bloque: BlockchainAuditResponse): void {
    this.bloqueSeleccionado = bloque;
  }

  cerrarDetalles(): void {
    this.bloqueSeleccionado = null;
  }

  // ===================================================
  // SIGUIENTE
  // ===================================================

  siguiente(): void {
    if (this.pagina < this.totalPaginas - 1) {
      this.pagina++;
      this.cargar();
    }
  }

  // ===================================================
  // ANTERIOR
  // ===================================================

  anterior(): void {
    if (this.pagina > 0) {
      this.pagina--;
      this.cargar();
    }
  }
}
