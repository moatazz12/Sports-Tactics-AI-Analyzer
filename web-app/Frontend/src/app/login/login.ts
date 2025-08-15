import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService, LoginRequest } from '../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  loginData: LoginRequest = {
    username: '',
    password: ''
  };

  isLoggingIn = false;
  loginError: string | null = null;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  onLogin() {
    if (!this.loginData.username || !this.loginData.password) {
      this.loginError = 'Veuillez remplir tous les champs';
      return;
    }

    this.isLoggingIn = true;
    this.loginError = null;

    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        this.isLoggingIn = false;
        // Rediriger selon le rôle
        const user = this.authService.getCurrentUser();
        if (user && user.username === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/userhome']);
        }
      },
      error: (error) => {
        this.isLoggingIn = false;
        this.loginError = error.error?.message || 'Échec de la connexion';
        console.error('Login error:', error);
      }
    });
  }
}
