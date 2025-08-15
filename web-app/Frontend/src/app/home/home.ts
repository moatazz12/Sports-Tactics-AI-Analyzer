import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoUpload } from '../video-upload/video-upload';
import { TacticalAnnotationForm } from '../tactical-annotation-form/tactical-annotation-form';
import { BulkUpload } from '../bulk-upload/bulk-upload';
import { Video } from '../services/video.service';
import { AuthService, User } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule, VideoUpload, TacticalAnnotationForm, BulkUpload],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  protected readonly title = 'Analyse Tactique Football';
  uploadedVideo: Video | null = null;
  currentUser: User | null = null;
  showBulkUpload = false;

  constructor(private authService: AuthService, private router: Router) {
    this.currentUser = this.authService.getCurrentUser();
  }

  onVideoUploaded(video: Video) {
    this.uploadedVideo = video;
    console.log('Video uploaded in home component:', video);
  }

  onAnnotationCreated(annotation: any) {
    console.log('Annotation created in home component:', annotation);
  }

  onNavigateToBulkUpload() {
    this.showBulkUpload = true;
  }

  onBackFromBulkUpload() {
    this.showBulkUpload = false;
  }

  goBackToUserhome() {
    this.router.navigate(['/userhome']);
  }

  logout() {
    this.authService.logout();
  }
} 