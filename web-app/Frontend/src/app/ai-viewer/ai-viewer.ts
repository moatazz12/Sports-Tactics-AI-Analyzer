import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { VideoService } from '../services/video.service';

@Component({
  selector: 'app-ai-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-viewer.html',
  styleUrl: './ai-viewer.css'
})
export class AiViewer implements OnInit, AfterViewInit {
  videoUrl: string | null = null;
  isLoading = false;
  error: string | null = null;
  stats: any | null = null;
  expectedIdSequence: string | null = null;
  rawResponse: any | null = null;
  uploadedFileName: string | null = null;
  @ViewChild('player') playerRef?: ElementRef<HTMLVideoElement>;

  constructor(private router: Router, private videoService: VideoService) {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state as { videoUrl?: string, idSequence?: string, fileName?: string } | undefined;
    this.videoUrl = state?.videoUrl || null;
    this.expectedIdSequence = state?.idSequence || null;
    this.uploadedFileName = state?.fileName || null;

    // Always prefer the server URL when we know the uploaded filename
    if (this.uploadedFileName) {
      const candidate = this.videoService.getUploadsFileUrl(this.uploadedFileName);
      if (candidate) this.videoUrl = candidate;
    }
  }

  ngOnInit(): void {
    this.fetchStats();
  }

  ngAfterViewInit(): void {
    // Autoplay when the video element is ready
    queueMicrotask(() => this.restartVideo());
    // Also restart when the video finishes (in case loop is removed later)
    const video = this.playerRef?.nativeElement;
    if (video) {
      video.addEventListener('ended', () => this.restartVideo());
    }
  }

  private restartVideo(): void {
    const video = this.playerRef?.nativeElement;
    if (!video || !this.videoUrl) return;
    try {
      video.pause();
      video.currentTime = 0;
      // Some browsers require muted to autoplay; attribute is set in template
      const p = video.play();
      if (p && typeof p.then === 'function') {
        p.catch(() => {
          // Ignore autoplay rejections silently
        });
      }
    } catch {
      // no-op
    }
  }

  fetchStats(): void {
    this.isLoading = true;
    this.error = null;
    this.stats = null;
    this.rawResponse = null;
    // Always fetch the full list and filter client-side to the uploaded video's id
    const expectedIdRaw = this.expectedIdSequence || (this.uploadedFileName ? String(this.uploadedFileName).replace(/\.[^/.]+$/, '') : null);
    const expectedId = expectedIdRaw ? this.videoService.generateIdSequence(expectedIdRaw) : null;

    this.videoService.getAiStatistics().subscribe({
      next: (data) => {
        // Backend may return either:
        // A) { results: [ { statistiques: {...} }, ... ] }
        // B) { statistiques: [...] }
        // C) [ ... ]
        // D) single object { id_sequence: ... }
        let payload: any = data;
        if (payload && Array.isArray(payload.results)) {
          // Map to array of plain statistiques objects
          payload = payload.results
            .map((row: any) => row?.statistiques ?? row)
            .filter((x: any) => !!x);
        } else if (payload && payload.statistiques) {
          payload = payload.statistiques;
        }
        this.rawResponse = payload;
        let selected: any | null = null;
        const normalize = (v: any) => {
          if (v == null) return null;
          // Lowercase, trim, and strip trailing " (n)" if present
          return String(v).trim().toLowerCase().replace(/\s*\(\d+\)$/, '');
        };
        const expectedIdNorm = normalize(expectedId);
        if (Array.isArray(payload)) {
          if (expectedIdNorm) {
            selected = payload.find((item: any) => normalize(item?.id_sequence) === expectedIdNorm) || null;
          } else {
            selected = payload[0] || null;
          }
        } else {
          if (expectedIdNorm && payload?.id_sequence && normalize(payload.id_sequence) !== expectedIdNorm) {
            selected = null;
          } else {
            selected = payload;
          }
        }
        this.stats = selected;
        this.isLoading = false;
        // Restart playback each time we refresh stats while staying on the page
        this.restartVideo();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load AI statistics';
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    // Utiliser l'historique du navigateur pour retourner à la page précédente
    window.history.back();
  }
}


