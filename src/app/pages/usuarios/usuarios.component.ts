import {
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { UsuarioService } from '../../core/services/usuario.service';

import { Usuario } from '../../core/models/usuario';

import { UsuarioFormComponent } from './usuario-form/usuario-form.component';

@Component({
  selector: 'app-usuarios',

  standalone: true,

  imports: [CommonModule, UsuarioFormComponent],

  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsuariosComponent implements OnInit {
  private usuarioService = inject(UsuarioService);
  private cdr = inject(ChangeDetectorRef);

  usuarios: Usuario[] = [];

  trackByFn(index: number, item: any): number {
    return item.id;
  }

  cargando: boolean = true;
  mostrarFormulario: boolean = false;
  usuarioSeleccionado?: Usuario;

  // Pagination
  currentPage: number = 0;
  pageSize: number = 10;
  totalElements: number = 0;
  totalPages: number = 0;

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargando = true;
    this.usuarioService.listar(this.currentPage, this.pageSize).subscribe({
      next: (response: any) => {
        if (response.data && response.data.content) {
          this.usuarios = response.data.content;
          this.totalElements = response.data.totalElements;
          this.totalPages = response.data.totalPages;
        } else {
          this.usuarios = [];
        }
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.cargando = false;
        this.cdr.markForCheck();
        import('sweetalert2').then((Swal) => {
          Swal.default.fire('Error', 'No se pudieron cargar los usuarios.', 'error');
        });
      },
    });
  }

  cambiarPagina(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.cargarUsuarios();
    }
  }

  nuevoUsuario(): void {
    this.usuarioSeleccionado = undefined;

    this.mostrarFormulario = true;
  }

  editar(usuario: Usuario): void {
    this.usuarioSeleccionado = usuario;

    this.mostrarFormulario = true;
  }

  guardarUsuario(datos: any): void {
    // EDITAR USUARIO

    if (this.usuarioSeleccionado) {
      this.usuarioService.actualizar(this.usuarioSeleccionado.id, datos).subscribe({
        next: () => {
          import('sweetalert2').then((Swal) => {
            Swal.default.fire('Éxito', 'Usuario actualizado correctamente.', 'success');
          });
          this.mostrarFormulario = false;
          this.usuarioSeleccionado = undefined;
          this.cargarUsuarios();
        },
        error: () => {
          import('sweetalert2').then((Swal) =>
            Swal.default.fire('Error', 'No se pudo actualizar el usuario.', 'error'),
          );
        },
      });
      return;
    }

    // CREAR USUARIO
    this.usuarioService.crear(datos).subscribe({
      next: () => {
        import('sweetalert2').then((Swal) => {
          Swal.default.fire('Éxito', 'Usuario creado correctamente.', 'success');
        });
        this.mostrarFormulario = false;
        this.currentPage = 0;
        this.cargarUsuarios();
      },
      error: () => {
        import('sweetalert2').then((Swal) =>
          Swal.default.fire('Error', 'No se pudo crear el usuario.', 'error'),
        );
      },
    });
  }

  cancelarFormulario(): void {
    this.mostrarFormulario = false;

    this.usuarioSeleccionado = undefined;
  }

  eliminar(id: number): void {
    import('sweetalert2').then((Swal) => {
      Swal.default
        .fire({
          title: '¿Desactivar usuario?',
          text: 'El usuario ya no podrá acceder al sistema',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, desactivar',
          cancelButtonText: 'Cancelar',
        })
        .then((result) => {
          if (result.isConfirmed) {
            this.usuarioService.eliminar(id).subscribe({
              next: () => {
                Swal.default.fire('Desactivado', 'Usuario desactivado correctamente.', 'success');
                this.cargarUsuarios();
              },
              error: () => {
                Swal.default.fire('Error', 'No se pudo desactivar el usuario.', 'error');
              },
            });
          }
        });
    });
  }

  desbloquear(id: number): void {
    import('sweetalert2').then((Swal) => {
      Swal.default
        .fire({
          title: '¿Desbloquear usuario?',
          text: 'Se restablecerán los intentos fallidos de inicio de sesión',
          icon: 'info',
          showCancelButton: true,
          confirmButtonText: 'Sí, desbloquear',
          cancelButtonText: 'Cancelar',
        })
        .then((result) => {
          if (result.isConfirmed) {
            this.usuarioService.desbloquear(id).subscribe({
              next: () => {
                Swal.default.fire('Desbloqueado', 'Usuario desbloqueado correctamente.', 'success');
                this.cargarUsuarios();
              },
              error: () => {
                Swal.default.fire('Error', 'No se pudo desbloquear el usuario.', 'error');
              },
            });
          }
        });
    });
  }
}
