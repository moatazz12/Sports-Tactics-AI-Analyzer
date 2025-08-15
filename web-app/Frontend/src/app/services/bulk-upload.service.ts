import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BulkUploadResult {
  videos: any[];
  annotations: any[];
  errors: Array<{ file?: string; annotation?: string; error: string }>;
}

@Injectable({
  providedIn: 'root'
})
export class BulkUploadService {
  private apiUrl = 'http://localhost:3000/video'; // Adjust port as needed

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  bulkUpload(files: File[], annotations: any[]): Observable<BulkUploadResult> {
    const formData = new FormData();
    
    // Add all files
    files.forEach(file => {
      formData.append('files', file);
    });

    // Add annotations as JSON string
    if (annotations && annotations.length > 0) {
      formData.append('annotations', JSON.stringify(annotations));
    }

    // For file uploads, we need to set the Authorization header manually
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<BulkUploadResult>(`${this.apiUrl}/bulkUpload`, formData, {
      headers: headers
    });
  }
} 