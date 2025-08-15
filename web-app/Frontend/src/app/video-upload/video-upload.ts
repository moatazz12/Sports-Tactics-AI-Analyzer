import { Component, EventEmitter, Output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoService, Video } from '../services/video.service';

@Component({
  selector: 'app-video-upload',
  imports: [CommonModule],
  templateUrl: './video-upload.html',
  styleUrl: './video-upload.css'
})
export class VideoUpload implements OnDestroy {
  selectedFile: File | null = null;
  fileName: string | null = null;
  videoPreviewUrl: string | null = null;
  isUploading = false;
  uploadError: string | null = null;
  uploadSuccess = false;
  uploadedVideo: Video | null = null;

  @Output() videoUploaded = new EventEmitter<Video>();

  constructor(private videoService: VideoService) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFile = file;
      this.fileName = file.name;
      this.uploadError = null;
      this.uploadSuccess = false;
      this.uploadedVideo = null;
      
      // Check if video with this filename already exists
      this.checkForDuplicate(file.name);
      
      // Create preview URL for the video
      this.videoPreviewUrl = URL.createObjectURL(file);
    } else {
      this.clearSelection();
    }
  }

  private checkForDuplicate(filename: string) {
    this.videoService.checkVideoExists(filename).subscribe({
      next: (response) => {
        const videos = response.data || [];
        const existingVideo = videos.find((video: any) => video.filename === filename);
        
        if (existingVideo) {
          this.uploadError = `⚠️ Une vidéo avec le nom '${filename}' existe déjà. Veuillez utiliser un nom différent ou supprimer la vidéo existante.`;
        }
      },
      error: (error) => {
        console.warn('Could not check for duplicates:', error);
        // Don't block upload if duplicate check fails
      }
    });
  }

  uploadVideo() {
    if (!this.selectedFile) {
      this.uploadError = 'Aucun fichier sélectionné';
      return;
    }

    this.isUploading = true;
    this.uploadError = null;
    this.uploadSuccess = false;

    console.log('Uploading file:', this.selectedFile.name, 'Size:', this.selectedFile.size, 'Type:', this.selectedFile.type);

    this.videoService.uploadVideo(this.selectedFile).subscribe({
      next: (response) => {
        this.isUploading = false;
        this.uploadSuccess = true;
        this.uploadedVideo = response.data;
        this.videoUploaded.emit(response.data);
        console.log('Video uploaded successfully:', response.data);
      },
      error: (error) => {
        this.isUploading = false;
        console.error('Upload error details:', error);
        
        if (error.status === 401) {
          this.uploadError = 'Non autorisé. Veuillez vous reconnecter.';
        } else if (error.status === 400) {
          // Check for duplicate filename error
          const errorMessage = error.error?.message || '';
          if (errorMessage.includes('already exists')) {
            this.uploadError = `❌ ${errorMessage}`;
          } else {
            this.uploadError = errorMessage || 'Erreur de validation du fichier';
          }
        } else if (error.status === 0) {
          this.uploadError = 'Impossible de se connecter au serveur. Vérifiez que le backend est démarré.';
        } else {
          this.uploadError = error.error?.message || 'Échec de l\'upload de la vidéo';
        }
        
        console.error('Upload error:', error);
      }
    });
  }

  cancelUpload() {
    this.clearSelection();
  }

  private clearSelection() {
    this.selectedFile = null;
    this.fileName = null;
    this.uploadError = null;
    this.uploadSuccess = false;
    this.uploadedVideo = null;
    
    // Clean up the preview URL to prevent memory leaks
    if (this.videoPreviewUrl) {
      URL.revokeObjectURL(this.videoPreviewUrl);
      this.videoPreviewUrl = null;
    }
  }

  // Get the id_sequence from the uploaded video filename
  getIdSequence(): string | null {
    if (this.uploadedVideo?.filename) {
      return this.videoService.generateIdSequence(this.uploadedVideo.filename);
    }
    return null;
  }

  // Clean up when component is destroyed
  ngOnDestroy() {
    if (this.videoPreviewUrl) {
      URL.revokeObjectURL(this.videoPreviewUrl);
    }
  }

  // Check if upload should be disabled
  isUploadDisabled(): boolean {
    return !this.selectedFile || this.isUploading || !!this.uploadError;
  }
}

