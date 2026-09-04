import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import Swal from 'sweetalert2';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-cambiar-password',

  standalone: true,

  imports: [FormsModule],

  templateUrl: './cambiar-password.component.html',

  styleUrls: ['./cambiar-password.component.css'],
})
export class CambiarPasswordComponent {
  private authService = inject(AuthService);

  private router = inject(Router);

  passwordActual = '';

  passwordNueva = '';

  confirmarPassword = '';

  cambiarPassword() {
    if (this.passwordNueva !== this.confirmarPassword) {
      Swal.fire({
        icon: 'warning',

        title: 'Atención',

        text: 'Las contraseñas no coinciden.',
      });

      return;
    }

    const usuario = this.authService.obtenerUsuario();

    if (!usuario) {
      Swal.fire({
        icon: 'error',

        title: 'Error',

        text: 'No existe usuario temporal.',
      });

      return;
    }

    const request = {
      username: usuario.username,

      passwordActual: this.passwordActual,

      passwordNueva: this.passwordNueva,
    };

    this.authService
      .cambiarPassword(request)

      .subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',

            title: 'Correcto',

            text: 'Contraseña cambiada. Ingrese nuevamente.',
          })

            .then(() => {
              this.authService.cerrarSesion();

              this.router.navigate(['/login']);
            });
        },

        error: (error) => {
          Swal.fire({
            icon: 'error',

            title: 'Error',

            text: error.error.message ?? 'No se pudo cambiar la contraseña.',
          });
        },
      });
  }
}
