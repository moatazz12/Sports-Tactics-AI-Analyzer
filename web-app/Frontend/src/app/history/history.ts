import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { Annotation } from '../annotation/annotation';
import { Rapport } from '../rapport/rapport';

@Component({
  selector: 'app-history',
  imports: [CommonModule,Annotation,Rapport],
  templateUrl: './history.html',
  styleUrl: './history.css'
})
export class History {
  currentUser: User | null = null;
  goBackEvent: any;
   constructor(
  private router: Router,
  private authService: AuthService
) {
  this.currentUser = this.authService.getCurrentUser();
}
  logout() {
  this.authService.logout();
  this.router.navigate(['/login']);
}


 goToManualHistory() {
    this.router.navigate(['/history/manual']);
  }

  goToIAHistory() {
    this.router.navigate(['/history/ia']);
  }
 
  goBack() {
    this.router.navigate(['/userhome']);
  }

 selectedHistory: 'manual' | 'ia' | null = null;

selectHistory(type: 'manual' | 'ia') {
  this.selectedHistory = type;
}
}
