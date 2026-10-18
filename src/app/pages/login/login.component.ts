import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import Swal from 'sweetalert2';

import { AuthService } from '../../core/services/auth.service';
import { CajaService } from '../../core/services/caja.service';
import { LoginRequest } from '../../core/models/login-request';
import { LoginResponse } from '../../core/models/login-response';
import { Rol } from '../../core/models/rol';

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
  private cajaService = inject(CajaService);
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

  cargando: boolean = false;
  mostrarPassword: boolean = false;

  // =========================================================
  // INICIAR SESIÓN
  // =========================================================

  iniciarSesion(): void {
    if (!this.loginRequest.username.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Atención',
        text: 'Ingrese el usuario.',
      });
      return;
    }

    if (!this.loginRequest.password.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Atención',
        text: 'Ingrese la contraseña.',
      });
      return;
    }

    this.cargando = true;

    this.authService.login(this.loginRequest).subscribe({
      next: (response) => {
        this.cargando = false;
        const usuario = response.data;

        // ---------------------------------------------------
        // PRIMER INGRESO
        // ---------------------------------------------------
        if (usuario.requiereCambioPassword) {
          this.authService.guardarUsuario(usuario);
          Swal.fire({
            icon: 'info',
            title: 'Primer ingreso',
            text: 'Debe cambiar su contraseña antes de continuar.',
          }).then(() => {
            this.router.navigate(['/cambiar-password']);
          });
          return;
        }

        // ---------------------------------------------------
        // LOGIN EXITOSO - GUARDAR Y PROCESAR FLUJO DE CAJA
        // ---------------------------------------------------
        this.authService.guardarUsuario(usuario);
        this.procesarFlujoPostLogin(usuario);
      },

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

  // =========================================================
  // FLUJO INTELIGENTE DE APERTURA DE CAJA SEGÚN ROL
  // =========================================================

  private procesarFlujoPostLogin(usuario: LoginResponse): void {
    this.cajaService.obtenerEstadoActual().subscribe({
      next: (res) => {
        const cajaAbierta = res.data?.abierta ?? false;

        if (usuario.rol === Rol.EMPLEADO) {
          // ===============================================
          // ROL EMPLEADO (Vendedor / Cajero)
          // ===============================================
          if (!cajaAbierta) {
            Swal.fire({
              title: `¡Hola, ${usuario.nombre || usuario.username}!`,
              html: `
                <div style="text-align: left; font-size: 14px; color: #cbd5e1; line-height: 1.5;">
                  <p class="mb-2">Para comenzar a operar el <strong>Punto de Venta</strong> es necesario abrir el turno de caja.</p>
                  <p class="mb-0 text-muted">Indica el fondo inicial de cambio que tienes en efectivo ($):</p>
                </div>
              `,
              icon: 'info',
              input: 'number',
              inputValue: 0,
              inputAttributes: {
                min: '0',
                step: '0.01',
                placeholder: '0.00',
              },
              inputLabel: 'Fondo Inicial de Caja ($)',
              showCancelButton: false,
              confirmButtonText: '<i class="fa-solid fa-lock-open"></i> Abrir Caja y Comenzar',
              confirmButtonColor: '#10b981',
              allowOutsideClick: false,
              allowEscapeKey: false,
              preConfirm: (value) => {
                const num = Number(value);
                if (isNaN(num) || num < 0) {
                  Swal.showValidationMessage('El monto inicial no puede ser negativo.');
                  return false;
                }
                return num;
              },
            }).then((result) => {
              if (result.isConfirmed) {
                const montoInicial = Number(result.value || 0);
                this.cajaService.abrir({ montoInicial }).subscribe({
                  next: () => {
                    Swal.fire({
                      icon: 'success',
                      title: 'Caja Abierta',
                      text: `Turno de ventas habilitado con $${montoInicial.toLocaleString('es-AR', { minimumFractionDigits: 2 })}.`,
                      timer: 1500,
                      showConfirmButton: false,
                    }).then(() => {
                      this.router.navigate(['/ventas']);
                    });
                  },
                  error: (err) => {
                    Swal.fire({
                      icon: 'error',
                      title: 'No se pudo abrir la caja',
                      text: err.error?.message || 'Error al iniciar turno.',
                    }).then(() => {
                      this.router.navigate(['/ventas']);
                    });
                  },
                });
              }
            });
          } else {
            // Caja ya abierta: directo a ventas
            this.router.navigate(['/ventas']);
          }
        } else {
          // ===============================================
          // ROL ADMIN O SUPER_ADMIN (Root / Auditoría)
          // ===============================================
          if (!cajaAbierta) {
            Swal.fire({
              title: `¡Bienvenido, ${usuario.nombre || usuario.username}!`,
              html: `
                <div style="text-align: left; font-size: 14px; color: #cbd5e1; line-height: 1.5;">
                  <p class="mb-2">La caja se encuentra actualmente <strong>CERRADA</strong>.</p>
                  <p class="mb-0 text-muted">¿Deseas abrir un turno para registrar operaciones o ingresar sólo para supervisión y auditoría?</p>
                </div>
              `,
              icon: 'question',
              showCancelButton: true,
              confirmButtonText: '<i class="fa-solid fa-lock-open"></i> Sí, Abrir Caja',
              cancelButtonText: '<i class="fa-solid fa-chart-pie"></i> Solo Supervisar / Auditar',
              confirmButtonColor: '#10b981',
              cancelButtonColor: '#6366f1',
              allowOutsideClick: false,
            }).then((adminChoice) => {
              if (adminChoice.isConfirmed) {
                // Desea abrir caja
                Swal.fire({
                  title: 'Apertura de Caja',
                  text: 'Indica el fondo inicial en efectivo para cambio ($):',
                  input: 'number',
                  inputValue: 0,
                  inputAttributes: { min: '0', step: '0.01' },
                  showCancelButton: true,
                  confirmButtonText: 'Confirmar Apertura',
                  cancelButtonText: 'Cancelar',
                  confirmButtonColor: '#10b981',
                  preConfirm: (value) => {
                    const num = Number(value);
                    if (isNaN(num) || num < 0) {
                      Swal.showValidationMessage('El monto inicial no puede ser negativo.');
                      return false;
                    }
                    return num;
                  },
                }).then((openRes) => {
                  if (openRes.isConfirmed) {
                    const montoInicial = Number(openRes.value || 0);
                    this.cajaService.abrir({ montoInicial }).subscribe({
                      next: () => {
                        Swal.fire({
                          icon: 'success',
                          title: 'Caja Abierta',
                          timer: 1500,
                          showConfirmButton: false,
                        }).then(() => {
                          this.router.navigate(['/dashboard']);
                        });
                      },
                      error: (err) => {
                        Swal.fire({
                          icon: 'error',
                          title: 'Error al abrir caja',
                          text: err.error?.message || 'No se pudo abrir la caja.',
                        }).then(() => {
                          this.router.navigate(['/dashboard']);
                        });
                      },
                    });
                  } else {
                    this.router.navigate(['/dashboard']);
                  }
                });
              } else {
                // Solo supervisar / auditar
                this.router.navigate(['/dashboard']);
              }
            });
          } else {
            // Caja ya abierta
            this.router.navigate(['/dashboard']);
          }
        }
      },
      error: () => {
        // En caso de fallo de red, ruta por defecto
        if (usuario.rol === Rol.EMPLEADO) {
          this.router.navigate(['/ventas']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
    });
  }
}
