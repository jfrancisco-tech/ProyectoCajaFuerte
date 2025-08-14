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

  getAvatarUrl(nombre: string, rol: string): string {
    // Avatar gris simple como Facebook
    const initial = nombre ? nombre.charAt(0).toUpperCase() : 'U';
    
    // SVG avatar con diseño gris simple
    const svg = `
      <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill="#e4e6ea"/>
        <circle cx="50" cy="37" r="14" fill="#8a8d91"/>
        <path d="M28 78c0-12 10-22 22-22s22 10 22 22v12H28V78z" fill="#8a8d91"/>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }
}
