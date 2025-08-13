import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {
  nombreUsuario: string = '';
  rolUsuario: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Obtener información del usuario autenticado
    this.nombreUsuario = this.authService.getUserName();
    const user = this.authService.getCurrentUser();
    this.rolUsuario = user?.rol || '';
  }

  logout() {
    this.authService.logout();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}
