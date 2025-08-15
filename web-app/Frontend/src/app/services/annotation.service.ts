import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreateAnnotationDto {
  id_sequence: string;
  annotation: string;
  validateur: string;
  commentaire: string;
  domicile: string;
  visiteuse: string;
  videoId: string;
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
export class AnnotationService {
  private apiUrl = 'http://localhost:3000/annotation'; // Adjust port as needed
  private videoApiUrl = 'http://localhost:3000/video'; // Video API URL

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Validate if video exists before creating annotation
  validateVideoExists(videoId: string): Observable<any> {
    return this.http.get(`${this.videoApiUrl}/getVideoById/${videoId}`, {
      headers: this.getHeaders()
    });
  }

  createAnnotation(annotation: CreateAnnotationDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/createAnnotation`, annotation, {
      headers: this.getHeaders()
    });
  }

  getAllAnnotations(): Observable<any> {
    return this.http.get(`${this.apiUrl}/getAllAnnotation`, {
      headers: this.getHeaders()
    });
  }

  getAnnotationById(id_sequence: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/getAnnotationById/${id_sequence}`, {
      headers: this.getHeaders()
    });
  }

  updateAnnotation(id_sequence: string, annotation: Partial<CreateAnnotationDto>): Observable<any> {
    return this.http.patch(`${this.apiUrl}/updateAnnotation/${id_sequence}`, annotation, {
      headers: this.getHeaders()
    });
  }

  deleteAnnotation(id_sequence: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deleteAnnotation/${id_sequence}`, {
      headers: this.getHeaders()
    });
  }
} 