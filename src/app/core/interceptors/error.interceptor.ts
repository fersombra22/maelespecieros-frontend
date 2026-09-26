import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMsg = 'Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.';
      let errorTitle = 'Error';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMsg = error.error.message;
      } else {
        // Server-side error
        if (error.status === 401) {
          errorTitle = 'Sesión expirada';
          errorMsg = 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.';
          authService.cerrarSesion();
          router.navigate(['/login']);
        } else if (error.status === 403) {
          errorTitle = 'Acceso Denegado';
          errorMsg = 'No tienes permisos suficientes para realizar esta acción.';
        } else if (error.error && error.error.message) {
          errorMsg = error.error.message;
        } else if (typeof error.error === 'string') {
          errorMsg = error.error;
        } else if (error.message) {
          errorMsg = error.message;
        }
      }

      Swal.fire({
        icon: 'error',
        title: errorTitle,
        text: errorMsg,
        confirmButtonColor: '#3f7d3a',
      });

      return throwError(() => error);
    }),
  );
};
