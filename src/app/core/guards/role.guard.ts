import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { Rol } from '../models/rol';

export const roleGuard = (rolesPermitidos: Rol[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const usuario = authService.obtenerUsuario();

    if (!usuario) {
      router.navigate(['/login']);
      return false;
    }

    if (rolesPermitidos.includes(usuario.rol)) {
      return true;
    }

    router.navigate(['/dashboard']);
    return false;
  };
};
