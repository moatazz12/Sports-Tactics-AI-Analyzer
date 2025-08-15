import { Component } from '@angular/core';
import { DatePipe, CommonModule } from '@angular/common';
import { AuthService, User } from '../services/auth.service';

@Component({
  selector: 'app-annotation',
  imports: [CommonModule, DatePipe],
  templateUrl: './annotation.html',
  styleUrl: './annotation.css'
})
export class Annotation {
  annotations = [
    {
      id: '1',
      id_sequence: 'SEQ-001',
      annotation: 'Bloc bas',
      date_annotation: new Date('2025-08-01T10:00:00'),
      commentaire: 'Bonne organisation défensive',
      domicile: 'MCI',
      visiteuse: 'BUR',
      videoId: 'vid1',
      videoFile: 'video1.mp4'
    },
    {
      id: '2',
      id_sequence: 'SEQ-002',
      annotation: 'Pressing haut',
      date_annotation: new Date('2025-08-02T15:30:00'),
      commentaire: 'Pressing efficace en début de match',
      domicile: 'BAR',
      visiteuse: 'TOT',
      videoId: 'vid2',
      videoFile: 'video2.mp4'
    }
  ];

  filteredAnnotations: typeof this.annotations = [];
  currentUser: User | null = null;
  hoveredVideo: any = null;

  constructor(private authService: AuthService) {
    this.currentUser = this.authService.getCurrentUser();
    this.filteredAnnotations = this.annotations;
  }

  togglePlay(video: HTMLVideoElement) {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }

  getProgress(video: HTMLVideoElement): number {
    if (!video.duration) return 0;
    return (video.currentTime / video.duration) * 100;
  }

  getVideoUrl(ann: any): string {
    return 'assets/mock-videos/' + ann.videoFile;
  }
}
