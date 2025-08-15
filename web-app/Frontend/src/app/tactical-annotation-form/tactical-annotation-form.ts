import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AnnotationService, CreateAnnotationDto } from '../services/annotation.service';
import { Video } from '../services/video.service';
import { AuthService, User } from '../services/auth.service';

@Component({
  selector: 'app-tactical-annotation-form',
  imports: [FormsModule, CommonModule],
  templateUrl: './tactical-annotation-form.html',
  styleUrl: './tactical-annotation-form.css'
})
export class TacticalAnnotationForm {
  @Input() uploadedVideo: Video | null = null;
  @Output() annotationCreated = new EventEmitter<any>();
  @Output() navigateToBulkUpload = new EventEmitter<void>();

  formData = {
    equipeDomicile: '',
    equipeVisiteuse: '',
    entraineur: '',
    annotationTactique: '',
    commentaire: ''
  };

  isSubmitting = false;
  submitError: string | null = null;
  submitSuccess = false;
  currentUser: User | null = null;

  constructor(private annotationService: AnnotationService, private authService: AuthService) {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.formData.entraineur = this.currentUser.username;
    }
  }

  // Method to navigate to bulk upload
  goToBulkUpload() {
    this.navigateToBulkUpload.emit();
  }

  // Enhanced video validation
  private validateVideo(): { isValid: boolean; error?: string } {
    // Check if video exists
    if (!this.uploadedVideo) {
      return { isValid: false, error: 'Aucune vidéo sélectionnée. Veuillez d\'abord uploader une vidéo.' };
    }

    // Check if video has required properties
    if (!this.uploadedVideo.id) {
      return { isValid: false, error: 'Vidéo invalide: ID manquant.' };
    }

    // Check if video has a filename or path
    if (!this.uploadedVideo.filename && !this.uploadedVideo.path) {
      return { isValid: false, error: 'Vidéo invalide: nom de fichier ou chemin manquant.' };
    }

    // Check if video ID is not empty
    if (this.uploadedVideo.id.trim() === '') {
      return { isValid: false, error: 'Vidéo invalide: ID vide.' };
    }

    return { isValid: true };
  }

  // Enhanced form validation
  private validateForm(): { isValid: boolean; error?: string } {
    if (!this.formData.equipeDomicile.trim()) {
      return { isValid: false, error: 'Le nom de l\'équipe domicile est requis.' };
    }

    if (!this.formData.equipeVisiteuse.trim()) {
      return { isValid: false, error: 'Le nom de l\'équipe visiteuse est requis.' };
    }

    if (!this.formData.entraineur.trim()) {
      return { isValid: false, error: 'Le nom de l\'entraîneur est requis.' };
    }

    if (!this.formData.annotationTactique.trim()) {
      return { isValid: false, error: 'L\'annotation tactique est requise.' };
    }

    // Check for minimum length requirements
    if (this.formData.annotationTactique.trim().length < 3) {
      return { isValid: false, error: 'L\'annotation tactique doit contenir au moins 3 caractères.' };
    }

    // Check if teams are different
    if (this.formData.equipeDomicile.trim().toLowerCase() === this.formData.equipeVisiteuse.trim().toLowerCase()) {
      return { isValid: false, error: 'Les équipes domicile et visiteuse doivent être différentes.' };
    }

    return { isValid: true };
  }

  onSubmit() {
    // Clear previous errors
    this.submitError = null;
    this.submitSuccess = false;

    // Validate video first
    const videoValidation = this.validateVideo();
    if (!videoValidation.isValid) {
      this.submitError = videoValidation.error || 'Erreur de validation vidéo';
      return;
    }

    // Validate form data
    const formValidation = this.validateForm();
    if (!formValidation.isValid) {
      this.submitError = formValidation.error || 'Erreur de validation du formulaire';
      return;
    }

    this.isSubmitting = true;

    // First, validate that the video exists on the backend
    this.annotationService.validateVideoExists(this.uploadedVideo!.id).subscribe({
      next: (videoResponse) => {
        // Video exists, proceed with annotation creation
        this.createAnnotation();
      },
      error: (videoError) => {
        this.isSubmitting = false;
        console.error('Video validation error:', videoError);
        
        if (videoError.status === 404) {
          this.submitError = 'Vidéo non trouvée sur le serveur. Veuillez recharger la page et réessayer.';
        } else if (videoError.status === 401) {
          this.submitError = 'Session expirée. Veuillez vous reconnecter.';
        } else if (videoError.status === 0) {
          this.submitError = 'Impossible de se connecter au serveur. Vérifiez votre connexion.';
        } else {
          this.submitError = 'Erreur lors de la validation de la vidéo.';
        }
      }
    });
  }

  private createAnnotation() {
    // Generate id_sequence from video filename (without extension)
    const idSequence = this.uploadedVideo!.filename 
      ? this.uploadedVideo!.filename.replace(/\.[^/.]+$/, '')
      : this.uploadedVideo!.id;

    const annotationData: CreateAnnotationDto = {
      id_sequence: idSequence,
      annotation: this.formData.annotationTactique.trim(),
      validateur: this.formData.entraineur.trim(),
      commentaire: this.formData.commentaire?.trim() || '',
      domicile: this.formData.equipeDomicile.trim(),
      visiteuse: this.formData.equipeVisiteuse.trim(),
      videoId: this.uploadedVideo!.id
    };

    this.annotationService.createAnnotation(annotationData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.submitSuccess = true;
        this.annotationCreated.emit(response.data);
        console.log('Annotation created successfully:', response.data);
        this.resetForm();
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Annotation creation error:', error);
        
        // Handle specific error cases
        if (error.status === 400) {
          this.submitError = error.error?.message || 'Données invalides. Veuillez vérifier vos informations.';
        } else if (error.status === 404) {
          this.submitError = 'Vidéo non trouvée. Veuillez recharger la page et réessayer.';
        } else if (error.status === 409) {
          this.submitError = 'Une annotation existe déjà pour cette séquence vidéo.';
        } else if (error.status === 0) {
          this.submitError = 'Impossible de se connecter au serveur. Vérifiez votre connexion.';
        } else {
          this.submitError = error.error?.message || 'Erreur lors de la création de l\'annotation.';
        }
      }
    });
  }

  resetForm() {
    this.formData = {
      equipeDomicile: '',
      equipeVisiteuse: '',
      entraineur: this.currentUser ? this.currentUser.username : '',
      annotationTactique: '',
      commentaire: ''
    };
    this.submitError = null;
    this.submitSuccess = false;
  }

  // Enhanced submit validation
  canSubmit(): boolean {
    const videoValidation = this.validateVideo();
    const formValidation = this.validateForm();
    
    return videoValidation.isValid && formValidation.isValid && !this.isSubmitting;
  }

  // Helper method to get the display filename
  getDisplayFilename(): string {
    if (!this.uploadedVideo) return 'Aucune vidéo sélectionnée';
    return this.uploadedVideo.filename || `Vidéo (ID: ${this.uploadedVideo.id})`;
  }

  // Helper method to get the id sequence display
  getIdSequenceDisplay(): string {
    if (!this.uploadedVideo) return '';
    return this.uploadedVideo.filename 
      ? this.uploadedVideo.filename.replace(/\.[^/.]+$/, '')
      : this.uploadedVideo.id;
  }

  // Helper method to check if video is ready for annotation
  isVideoReady(): boolean {
    return this.validateVideo().isValid;
  }

  // Helper method to get video status message
  getVideoStatusMessage(): string {
    if (!this.uploadedVideo) {
      return '⏳ En attente d\'upload vidéo';
    }
    
    const validation = this.validateVideo();
    if (!validation.isValid) {
      return `❌ ${validation.error}`;
    }
    
    return `✅ Vidéo prête pour annotation`;
  }
}
