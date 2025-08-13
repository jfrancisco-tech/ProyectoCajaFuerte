import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cambiar-contrasena',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cambiar-contrasena.component.html',
  styleUrl: './cambiar-contrasena.component.css'
})
export class CambiarContrasenaComponent {
  changePasswordForm: FormGroup;
  loading = false;
  message = '';
  messageType = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.changePasswordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
      newPassword: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
      confirmPassword: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]]
    });
  }

  onSubmit() {
    if (this.changePasswordForm.valid) {
      const { currentPassword, newPassword, confirmPassword } = this.changePasswordForm.value;
      
      if (newPassword !== confirmPassword) {
        this.showMessage('Las contraseñas no coinciden', 'error');
        return;
      }

      this.loading = true;
      this.authService.changeKeypadPassword(currentPassword, newPassword).subscribe({
        next: (response) => {
          this.loading = false;
          this.showMessage('Contraseña actualizada exitosamente', 'success');
          this.changePasswordForm.reset();
        },
        error: (error) => {
          this.loading = false;
          this.showMessage(error.error?.message || 'Error al cambiar contraseña', 'error');
        }
      });
    }
  }

  private showMessage(message: string, type: string) {
    this.message = message;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
      this.messageType = '';
    }, 5000);
  }
}
