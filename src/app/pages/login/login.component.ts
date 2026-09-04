import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import Swal from 'sweetalert2';

import { AuthService } from '../../core/services/auth.service';
import { LoginRequest } from '../../core/models/login-request';

@Component({
  selector: 'app-login',
  standalone: true,

  imports: [CommonModule, FormsModule],

  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  // =========================================================
  // DEPENDENCIAS
  // =========================================================

  private authService = inject(AuthService);

  private router = inject(Router);

  // =========================================================
  // DATOS DEL LOGIN
  // =========================================================

  loginRequest: LoginRequest = {
    username: '',

    password: '',
  };

  // =========================================================
  // ESTADOS DE LA INTERFAZ
  // =========================================================

  /**
   * Indica si el login se encuentra procesando.
   */
  cargando: boolean = false;

  /**
   * Controla la visibilidad de la contraseña.
   *
   * false = contraseña oculta
   * true  = contraseña visible
   */
  mostrarPassword: boolean = false;

  // =========================================================
  // INICIAR SESIÓN
  // =========================================================

  iniciarSesion(): void {
    // -------------------------------------------------------
    // VALIDAR USUARIO
    // -------------------------------------------------------

    if (!this.loginRequest.username.trim()) {
      Swal.fire({
        icon: 'warning',

        title: 'Atención',

        text: 'Ingrese el usuario.',
      });

      return;
    }

    // -------------------------------------------------------
    // VALIDAR CONTRASEÑA
    // -------------------------------------------------------

    if (!this.loginRequest.password.trim()) {
      Swal.fire({
        icon: 'warning',

        title: 'Atención',

        text: 'Ingrese la contraseña.',
      });

      return;
    }

    // -------------------------------------------------------
    // ACTIVAR ESTADO DE CARGA
    // -------------------------------------------------------

    this.cargando = true;

    // -------------------------------------------------------
    // LLAMAR AL SERVICIO DE AUTENTICACIÓN
    // -------------------------------------------------------

    this.authService
      .login(this.loginRequest)

      .subscribe({
        // =====================================================
        // LOGIN EXITOSO
        // =====================================================

        next: (response) => {
          this.cargando = false;

          const usuario = response.data;

          // ---------------------------------------------------
          // PRIMER INGRESO
          //
          // Usuario creado por el sistema y que
          // debe cambiar su contraseña.
          // ---------------------------------------------------

          if (usuario.requiereCambioPassword) {
            this.authService.guardarUsuario(usuario);

            Swal.fire({
              icon: 'info',

              title: 'Primer ingreso',

              text: 'Debe cambiar su contraseña antes de continuar.',
            })

              .then(() => {
                this.router.navigate(['/cambiar-password']);
              });

            return;
          }

          // ---------------------------------------------------
          // LOGIN NORMAL
          // ---------------------------------------------------

          this.authService.guardarUsuario(usuario);

          Swal.fire({
            icon: 'success',

            title: 'Bienvenido',

            text: response.message,

            timer: 1500,

            showConfirmButton: false,
          })

            .then(() => {
              this.router.navigate(['/dashboard']);
            });
        },

        // =====================================================
        // ERROR DE LOGIN
        // =====================================================

        error: (error) => {
          this.cargando = false;

          Swal.fire({
            icon: 'error',

            title: 'Error',

            text: error.error?.message ?? 'Error al iniciar sesión.',
          });
        },
      });
  }
}
