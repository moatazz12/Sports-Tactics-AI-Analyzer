import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Video {
  id: string;
  path: string;
  filename?: string;
  annotations?: Annotation[];
}

export interface Annotation {
  id: string;
  id_sequence: string;
  annotation: string;
  validateur: string;
  date_annotation?: Date;
  commentaire: string;
  domicile: string;
  visiteuse: string;
  videoId: string;
}

@Injectable({
  providedIn: 'root'
})
export class VideoService {
  private apiUrl = 'http://localhost:3000/video'; // Adjust port as needed
  private aiApiBaseUrl = 'http://localhost:8000';
  private uploadsBaseUrl = 'http://localhost:3000/uploads';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  uploadVideo(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('video', file);

    // For file uploads, we need to set the Authorization header manually
    // since FormData doesn't automatically include it
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(`${this.apiUrl}/uploadVideo`, formData, {
      headers: headers
    });
  }

  getAllVideos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/getAllVideos`, {
      headers: this.getHeaders()
    });
  }

  getVideoById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/getVideoById/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Check if a video with the given filename already exists
  checkVideoExists(filename: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/getAllVideos`, {
      headers: this.getHeaders()
    });
  }

  deleteVideo(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deleteVideo/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Helper method to generate id_sequence from filename
  generateIdSequence(filename: string): string {
    // 1) Remove file extension
    let base = filename.replace(/\.[^/.]+$/, '');
    // 2) Remove trailing " (n)" that some OSs add to duplicate downloads
    base = base.replace(/\s*\(\d+\)$/, '');
    // 3) Trim whitespace
    return base.trim();
  }

  // Build a public URL to play an uploaded video by filename
  getUploadsFileUrl(filename: string | null | undefined): string | null {
    if (!filename) return null;
    return `${this.uploadsBaseUrl}/${encodeURIComponent(filename)}`;
  }

  // AI prediction stats (endpoint does not require id)
  getAiStatistics(): Observable<any> {
    return this.http.get(`${this.aiApiBaseUrl}/collect-files/`);
  }

  // AI prediction stats for a specific id_sequence (preferred when available)
  getAiStatisticsById(idSequence: string): Observable<any> {
    return this.http.get(`${this.aiApiBaseUrl}/collect-files/${encodeURIComponent(idSequence)}`);
  }
} 