import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import Swal from 'sweetalert2';

import { CategoriaService } from '../../core/services/categoria.service';

import { Categoria } from '../../core/models/categoria';

import { CategoriaRequest } from '../../core/models/categoria-request';

@Component({
  selector: 'app-categorias',

  standalone: true,

  imports: [CommonModule, FormsModule],

  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoriasComponent implements OnInit {
  private categoriaService = inject(CategoriaService);
  private cdr = inject(ChangeDetectorRef);

  categorias: Categoria[] = [];

  mostrarModal: boolean = false;
  modoEdicion: boolean = false;
  categoriaId: number | null = null;
  cargando: boolean = true;

  // Paginación
  currentPage: number = 0;
  pageSize: number = 10;
  totalElements: number = 0;
  totalPages: number = 0;

  categoria: CategoriaRequest = {
    nombre: '',
    descripcion: '',
    prefijo: '',
  };

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.categoriaService.listar(this.currentPage, this.pageSize).subscribe({
      next: (response: any) => {
        if (response.data && response.data.content) {
          this.categorias = response.data.content;
          this.totalElements = response.data.totalElements;
          this.totalPages = response.data.totalPages;
        } else {
          this.categorias = [];
        }
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.cargando = false;
        this.cdr.markForCheck();
        console.error('Error cargando categorías:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar las categorías.',
        });
      },
    });
  }

  cambiarPagina(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.cargar();
    }
  }

  abrirNuevo(): void {
    this.modoEdicion = false;

    this.categoriaId = null;

    this.categoria = {
      nombre: '',

      descripcion: '',

      prefijo: '',
    };

    this.mostrarModal = true;
  }

  editar(item: Categoria): void {
    this.modoEdicion = true;

    this.categoriaId = item.id;

    this.categoria = {
      nombre: item.nombre,

      descripcion: item.descripcion,

      prefijo: item.prefijo,
    };

    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  guardar(): void {
    if (!this.categoria.nombre.trim() || !this.categoria.prefijo.trim()) {
      Swal.fire({
        icon: 'warning',

        title: 'Datos incompletos',

        text: 'Nombre y prefijo son obligatorios.',
      });

      return;
    }

    if (this.modoEdicion && this.categoriaId !== null) {
      this.categoriaService.actualizar(this.categoriaId, this.categoria).subscribe(() => {
        Swal.fire({
          icon: 'success',
          title: 'Categoría actualizada',
          timer: 1500,
          showConfirmButton: false,
        });
        this.cargar();
        this.cerrarModal();
      });
    } else {
      this.categoriaService.crear(this.categoria).subscribe(() => {
        Swal.fire({
          icon: 'success',
          title: 'Categoría creada',
          timer: 1500,
          showConfirmButton: false,
        });
        this.currentPage = 0;
        this.cargar();
        this.cerrarModal();
      });
    }
  }

  desactivar(categoria: Categoria): void {
    Swal.fire({
      title: '¿Desactivar categoría?',

      text: categoria.nombre,

      icon: 'warning',

      showCancelButton: true,

      confirmButtonText: 'Sí, desactivar',

      cancelButtonText: 'Cancelar',
    })

      .then((resultado) => {
        if (resultado.isConfirmed) {
          this.categoriaService
            .eliminar(categoria.id)

            .subscribe(() => {
              Swal.fire({
                icon: 'success',

                title: 'Categoría desactivada',

                timer: 1500,

                showConfirmButton: false,
              });

              this.cargar();
            });
        }
      });
  }

  activar(categoria: Categoria): void {
    this.categoriaService
      .activar(categoria.id)

      .subscribe(() => {
        Swal.fire({
          icon: 'success',

          title: 'Categoría activada',

          timer: 1500,

          showConfirmButton: false,
        });

        this.cargar();
      });
  }
}
