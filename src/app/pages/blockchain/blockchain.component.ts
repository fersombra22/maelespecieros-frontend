import { Component, OnInit, inject, ChangeDetectionStrategy, signal } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlockchainComponent implements OnInit {
  private service = inject(BlockchainService);

  bloques = signal<BlockchainAuditResponse[]>([]);
  anomalias = signal<AnomaliaAuditoriaResponse[]>([]);

  valida = signal(false);
  mensaje = signal('');
  pagina = signal(0);
  totalPaginas = signal(0);
  cargando = signal(false);
  verificando = signal(false);

  trackByFn(index: number, item: any): number {
    return item.id;
  }

  // Variable para controlar el modal de autopsia forense
  bloqueSeleccionado = signal<BlockchainAuditResponse | null>(null);

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
    this.cargando.set(true);

    this.service.listar(this.pagina()).subscribe({
      next: (resp) => {
        this.bloques.set(resp.content);
        this.totalPaginas.set(resp.totalPages);
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('Error cargando blockchain:', error);
        this.bloques.set([]);
        this.totalPaginas.set(0);
        this.cargando.set(false);
      },
    });
  }

  // ===================================================
  // VERIFICAR CADENA
  // ===================================================

  verificarCadena(): void {
    this.verificando.set(true);
    this.service.verificar().subscribe({
      next: (resp: any) => {
        this.verificando.set(false);
        // Determinamos la validez de forma robusta
        if (typeof resp === 'boolean') {
          this.valida.set(resp);
        } else if (resp && resp.data !== undefined) {
          if (typeof resp.data === 'boolean') {
            this.valida.set(resp.data);
          } else if (resp.data && typeof resp.data.valida === 'boolean') {
            this.valida.set(resp.data.valida);
          } else {
            this.valida.set(true);
          }
        } else if (resp && typeof resp.valida === 'boolean') {
          this.valida.set(resp.valida);
        } else {
          this.valida.set(true);
        }

        // Extraer anomalías
        if (resp && resp.data && Array.isArray(resp.data.anomalias)) {
          this.anomalias.set(resp.data.anomalias);
        } else if (resp && Array.isArray(resp.anomalias)) {
          this.anomalias.set(resp.anomalias);
        } else {
          this.anomalias.set([]);
        }

        if (this.valida()) {
          this.mensaje.set('La cadena blockchain es válida.');
        } else {
          this.mensaje.set('La cadena blockchain presenta inconsistencias.');
        }
      },
      error: (error) => {
        console.error('Error verificando blockchain:', error);
        this.verificando.set(false);
        this.valida.set(false);
        this.anomalias.set([]);
        this.mensaje.set('No se pudo verificar la cadena blockchain.');
      },
    });
  }

  // ===================================================
  // MÉTODOS PARA EL MODAL DE DETALLES (AUTOPSIA)
  // ===================================================

  verDetalles(bloque: BlockchainAuditResponse): void {
    this.bloqueSeleccionado.set(bloque);
  }

  cerrarDetalles(): void {
    this.bloqueSeleccionado.set(null);
  }

  // ===================================================
  // SIGUIENTE
  // ===================================================

  siguiente(): void {
    if (this.pagina() < this.totalPaginas() - 1) {
      this.pagina.update((p) => p + 1);
      this.cargar();
    }
  }

  // ===================================================
  // ANTERIOR
  // ===================================================

  anterior(): void {
    if (this.pagina() > 0) {
      this.pagina.update((p) => p - 1);
      this.cargar();
    }
  }
}
