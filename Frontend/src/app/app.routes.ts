import { Routes } from '@angular/router';
import { InicioComponent } from './components/inicio/inicio.component';
import { LoginComponent } from './components/login/login.component';
import { LayoutComponent } from './components/layout/layout.component';
import { CambiarContrasenaComponent } from './components/cambiar-contrasena/cambiar-contrasena.component';
import { SensoresComponent } from './components/sensores/sensores.component';
import { FeedsComponent } from './components/feeds/feeds.component';
import { AuditoriaComponent } from './components/auditoria/auditoria.component';
import { PerfilComponent } from './components/perfil/perfil.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: '/inicio', pathMatch: 'full' },
      { path: 'inicio', component: InicioComponent },
      { path: 'cambiar-contrasena', component: CambiarContrasenaComponent },
      { path: 'sensores', component: SensoresComponent },
      { path: 'feeds', component: FeedsComponent },
      { path: 'auditoria', component: AuditoriaComponent },
      { path: 'perfil', component: PerfilComponent },
    ]
  },
  { path: '**', redirectTo: '/login' }
];
