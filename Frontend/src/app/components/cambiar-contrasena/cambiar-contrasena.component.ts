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

  // Método para permitir solo números en los inputs
  onlyNumbers(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    // Permitir teclas de control (backspace, delete, tab, etc.)
    if (charCode === 8 || charCode === 9 || charCode === 27 || charCode === 46 ||
        (charCode >= 35 && charCode <= 40)) {
      return true;
    }
    // Permitir solo números (0-9)
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  // Método para filtrar solo números al pegar texto
  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text') || '';
    const numbersOnly = pastedText.replace(/[^0-9]/g, '').substring(0, 4);
    
    const target = event.target as HTMLInputElement;
    const controlName = target.getAttribute('formControlName');
    
    if (controlName && this.changePasswordForm.get(controlName)) {
      this.changePasswordForm.get(controlName)?.setValue(numbersOnly);
    }
  }
}
