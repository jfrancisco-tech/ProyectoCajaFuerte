import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class InicioComponent implements OnInit {
  // Datos del sistema de seguridad
  sistemasActivos: number = 0;
  eventosRecientes: number = 0;
  dispositivosConectados: number = 0;
  nombreUsuario: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Sistema de caja fuerte inteligente
  }

  ngOnInit() {
    // Obtener información del usuario autenticado
    this.nombreUsuario = this.authService.getUserName();
    
    // Simulación de datos del sistema de seguridad
    this.sistemasActivos = 8;
    this.eventosRecientes = 24;
    this.dispositivosConectados = 5;
  }

  logout() {
    this.authService.logout();
  }
}
