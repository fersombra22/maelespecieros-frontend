import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);

  const router = inject(Router);

  if (authService.requiereCambioPassword()) {
    router.navigate(['/cambiar-password']);

    return false;
  }

  if (authService.estaLogueado()) {
    return true;
  }

  router.navigate(['/login']);

  return false;
};
