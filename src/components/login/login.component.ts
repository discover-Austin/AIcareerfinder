import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  // FIX: Explicitly type the injected FormBuilder to fix type inference issue.
  private fb: FormBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  // FIX: Explicitly type the injected Router to fix type inference issue.
  private router: Router = inject(Router);

  isLoginMode = signal(true);
  errorMessage = signal<string | null>(null);
  isLoading = signal(false);

  loginForm = this.fb.group({
    name: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  toggleMode(): void {
    this.isLoginMode.update(val => !val);
    this.errorMessage.set(null);
    this.loginForm.reset();
    this.updateNameValidator();
  }
  
  private updateNameValidator(): void {
    const nameControl = this.loginForm.get('name');
    if (this.isLoginMode()) {
        nameControl?.clearValidators();
    } else {
        nameControl?.setValidators([Validators.required]);
    }
    nameControl?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.errorMessage.set('Please fill out all fields correctly.');
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { name, email, password } = this.loginForm.value;

    setTimeout(() => { // Simulate network latency
        let response: { success: boolean, message: string };

        if (this.isLoginMode()) {
            response = this.authService.login(email!, password!);
        } else {
            response = this.authService.register(name!, email!, password!);
        }
    
        if (response.success) {
            this.router.navigate(['/profile']);
        } else {
            this.errorMessage.set(response.message);
        }
        this.isLoading.set(false);
    }, 500);
  }
}
