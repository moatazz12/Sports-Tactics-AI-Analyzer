import { Component } from '@angular/core';
import { AuthService, User } from '../services/auth.service';
import { DatePipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-rapport',
  imports: [CommonModule, DatePipe],
  templateUrl: './rapport.html',
  styleUrl: './rapport.css'
})
export class Rapport {
  rapports: any[] = [];
  filteredRapports: any[] = [];
  currentUser: User | null = null;
  hoveredVideo: any = null;

  constructor(private authService: AuthService) {
    this.currentUser = this.authService.getCurrentUser();
    this.fetchRapports();
  }

  // Cette méthode sera remplacée par un appel API backend plus tard
  fetchRapports() {
    // MOCK : à remplacer par l'appel backend plus tard
    this.rapports = [
      {
        id: 'ia-1',
        id_sequence: 'SEQ-IA-001',
        annotation: 'Détection IA : Pressing haut',
        date_annotation: new Date('2025-08-03T11:00:00'),
        commentaire: 'Analyse IA : schéma médian détecté',
        domicile: 'FCB',
        visiteuse: 'MNC',
        videoId: 'vidia3',
        videoFile: 'video3.mp4'
      }
    ];
    this.filteredRapports = this.rapports;
  }

  getVideoUrl(ann: any): string {
    return 'assets/mock-videos/' + ann.videoFile;
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
}
