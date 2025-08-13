import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface UserProfile {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  created_at?: string;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit {
  userProfile: UserProfile | null = null;
  loading: boolean = true;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadUserProfile();
  }

  loadUserProfile() {
    this.loading = true;
    const currentUser = this.authService.getCurrentUser();
    
    if (currentUser) {
      this.userProfile = {
        id: currentUser.id,
        nombre: currentUser.usuario || 'Usuario',
        email: currentUser.email || 'No disponible',
        rol: currentUser.rol || 'usuario'
      };
    }
    
    this.loading = false;
  }

  getRoleName(rol: string): string {
    switch(rol) {
      case 'admin':
        return 'Administrador';
      case 'usuario':
        return 'Usuario';
      default:
        return rol;
    }
  }

  getRoleColor(rol: string): string {
    switch(rol) {
      case 'admin':
        return 'badge bg-danger';
      case 'usuario':
        return 'badge bg-primary';
      default:
        return 'badge bg-secondary';
    }
  }
}
