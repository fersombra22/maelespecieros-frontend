import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  private authService = inject(AuthService);

  private router = inject(Router);

  usuario = this.authService.obtenerUsuario();

  cerrarSesion(): void {
    this.authService.cerrarSesion();

    this.router.navigate(['/login']);
  }
}
