import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../services/auth.service';

@Component({
  selector: 'app-userhome',
  templateUrl: './userhome.html',
  styleUrl: './userhome.css'
})
export class Userhome {
  currentUser: User | null = null;
  
 constructor(
  private router: Router,
  private authService: AuthService
) {
  this.currentUser = this.authService.getCurrentUser();
}
  
  goToAutoAnnotation() {
    this.router.navigate(['/auto-annotation']); // adapte selon ton routing
  }

  goToManualAnnotation() {
    this.router.navigate(['/home']);
  }
  logout() {
  this.authService.logout();
  this.router.navigate(['/login']);
}

  goToAnnotationHistory() {
  this.router.navigate(['/history']);
}
}
