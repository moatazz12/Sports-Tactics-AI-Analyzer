import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BulkUploadService, BulkUploadResult } from '../services/bulk-upload.service';
import JSZip from 'jszip';

interface JsonObject {
  id_sequence: string;
  annotation: string;
  validateur: string;
  date_annotation: string;
  commentaire: string;
  domicile?: string;
  visiteuse?: string;
}

interface UploadFile {
  file: File;
  type: 'video' | 'json';
  id_sequence?: string;
  correspondingJson?: string;
}

@Component({
  selector: 'app-bulk-upload',
  imports: [CommonModule],
  templateUrl: './bulk-upload.html',
  styleUrl: './bulk-upload.css'
})
export class BulkUpload {
  @Output() goBackEvent = new EventEmitter<void>();
  
  isProcessing = false;
  processingError: string | null = null;
  processingSuccess = false;
  processingResult: BulkUploadResult | null = null;
  
  // JSON Splitter
  selectedJsonFile: File | null = null;
  jsonFileName: string | null = null;
  processedJsonFiles: { filename: string; content: string }[] = [];
  isJsonProcessing = false;
  jsonProcessingError: string | null = null;
  jsonProcessingSuccess = false;
  isDownloading = false;
  
  // File Upload
  uploadedFiles: UploadFile[] = [];
  isDragOver = false;
  uploadError: string | null = null;
  uploadSuccess = false;
  readonly MAX_FILES = 5;

  constructor(private bulkUploadService: BulkUploadService) {}

  goBack() {
    this.goBackEvent.emit();
  }

  // JSON Splitter Methods
  onJsonFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        this.jsonProcessingError = 'Veuillez sélectionner un fichier JSON valide.';
        return;
      }

      this.selectedJsonFile = file;
      this.jsonFileName = file.name;
      this.jsonProcessingError = null;
      this.jsonProcessingSuccess = false;
      this.processedJsonFiles = [];
    }
  }

  processJsonFile() {
    if (!this.selectedJsonFile) {
      this.jsonProcessingError = 'Aucun fichier sélectionné';
      return;
    }

    this.isJsonProcessing = true;
    this.jsonProcessingError = null;
    this.jsonProcessingSuccess = false;
    this.processedJsonFiles = [];

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const jsonData = JSON.parse(content);
        
        if (!Array.isArray(jsonData)) {
          this.jsonProcessingError = 'Le fichier JSON doit contenir un tableau d\'objets.';
          this.isJsonProcessing = false;
          return;
        }

        this.splitJsonObjects(jsonData);
        
        this.isJsonProcessing = false;
        this.jsonProcessingSuccess = true;
        
      } catch (error) {
        this.isJsonProcessing = false;
        this.jsonProcessingError = 'Erreur lors du parsing du fichier JSON.';
        console.error('JSON parsing error:', error);
      }
    };

    reader.readAsText(this.selectedJsonFile);
  }

  private splitJsonObjects(jsonArray: JsonObject[]) {
    const processedFiles: { filename: string; content: string }[] = [];
    let validCount = 0;
    let invalidCount = 0;

    console.log('Processing JSON array:', jsonArray);

    jsonArray.forEach((obj, index) => {
      console.log(`Processing object ${index}:`, obj);
      
      // Check each required field individually (domicile and visiteuse are optional)
      const missingFields = [];
      if (!obj.id_sequence) missingFields.push('id_sequence');
      if (!obj.annotation) missingFields.push('annotation');
      if (!obj.validateur) missingFields.push('validateur');
      
      if (missingFields.length > 0) {
        console.warn(`Object at index ${index} missing required fields: ${missingFields.join(', ')}`);
        invalidCount++;
        return;
      }

      const filename = `${obj.id_sequence}.json`;
      const jsonContent = JSON.stringify(obj, null, 2);
      
      processedFiles.push({
        filename,
        content: jsonContent
      });
      
      validCount++;
    });

    this.processedJsonFiles = processedFiles;
    console.log(`Successfully processed ${validCount} objects into individual files`);
    console.log(`Skipped ${invalidCount} invalid objects`);
    
    if (invalidCount > 0) {
      this.jsonProcessingError = `${invalidCount} objets invalides ignorés. Vérifiez que tous les objets ont les champs requis: id_sequence, annotation, validateur`;
    }
  }

  downloadAllJsonFiles() {
    console.log('Starting download of', this.processedJsonFiles.length, 'files');
    
    if (this.processedJsonFiles.length === 0) {
      console.warn('No files to download');
      return;
    }

    this.isDownloading = true;

    // Download files with a small delay between each to avoid browser blocking
    this.processedJsonFiles.forEach((file, index) => {
      setTimeout(() => {
        this.downloadFile(file.filename, file.content);
        
        // Set downloading to false after the last file
        if (index === this.processedJsonFiles.length - 1) {
          setTimeout(() => {
            this.isDownloading = false;
          }, 200);
        }
      }, index * 100); // 100ms delay between each download
    });
  }

  async downloadAsZip() {
    console.log('Creating zip file with', this.processedJsonFiles.length, 'files');
    
    if (this.processedJsonFiles.length === 0) {
      console.warn('No files to download');
      return;
    }

    this.isDownloading = true;

    try {
      const zip = new JSZip();
      
      // Add each file to the zip
      this.processedJsonFiles.forEach(file => {
        zip.file(file.filename, file.content);
      });
      
      // Generate the zip file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // Download the zip file
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'annotations.zip';
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      setTimeout(() => {
        URL.revokeObjectURL(url);
        this.isDownloading = false;
      }, 1000);
      
      console.log('Zip download completed');
    } catch (error) {
      console.error('Zip download failed:', error);
      this.isDownloading = false;
    }
  }

  downloadIndividualFile(filename: string, content: string) {
    try {
      console.log('Downloading individual file:', filename);
      this.downloadFile(filename, content);
    } catch (error) {
      console.error('Individual download failed for:', filename, error);
    }
  }

  downloadFile(filename: string, content: string) {
    try {
      console.log('Downloading file:', filename);
      
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL after a short delay
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
      
      console.log('Download completed for:', filename);
    } catch (error) {
      console.error('Download failed for:', filename, error);
    }
  }

  // File Upload Methods
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(Array.from(input.files));
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    
    if (event.dataTransfer?.files) {
      this.handleFiles(Array.from(event.dataTransfer.files));
    }
  }

  private handleFiles(files: File[]) {
    // Check if adding these files would exceed the limit
    const currentCount = this.uploadedFiles.length;
    const newFilesCount = files.length;
    
    if (currentCount + newFilesCount > this.MAX_FILES) {
      this.uploadError = `Limite de ${this.MAX_FILES} fichiers atteinte. Vous avez ${currentCount} fichiers et essayez d'ajouter ${newFilesCount} fichiers.`;
      return;
    }

    files.forEach(file => {
      const uploadFile: UploadFile = {
        file: file,
        type: this.getFileType(file)
      };
      
      // Try to find corresponding JSON file
      if (uploadFile.type === 'video') {
        const videoName = file.name.replace(/\.[^/.]+$/, '');
        const correspondingJson = this.processedJsonFiles.find(json => 
          json.filename === `${videoName}.json`
        );
        if (correspondingJson) {
          uploadFile.id_sequence = videoName;
          uploadFile.correspondingJson = correspondingJson.content;
        }
      }
      
      this.uploadedFiles.push(uploadFile);
    });
    
    this.uploadSuccess = true;
    this.uploadError = null;
  }

  private getFileType(file: File): 'video' | 'json' {
    if (file.type.startsWith('video/') || file.name.match(/\.(mp4|avi|mov|wmv|flv)$/i)) {
      return 'video';
    } else if (file.type === 'application/json' || file.name.endsWith('.json')) {
      return 'json';
    }
    return 'video'; // Default to video
  }

  removeFile(index: number) {
    this.uploadedFiles.splice(index, 1);
  }

  // Bulk Upload Processing
  processBulkUpload() {
    if (this.uploadedFiles.length === 0) {
      this.processingError = 'Aucun fichier sélectionné pour l\'upload en lot.';
      return;
    }

    if (this.uploadedFiles.length > this.MAX_FILES) {
      this.processingError = `Limite de ${this.MAX_FILES} fichiers dépassée. Veuillez supprimer des fichiers.`;
      return;
    }

    this.isProcessing = true;
    this.processingError = null;
    this.processingSuccess = false;
    this.processingResult = null;

    // Prepare files and annotations for upload
    const files = this.uploadedFiles.map(uploadFile => uploadFile.file);
    const annotations = this.uploadedFiles
      .filter(uploadFile => uploadFile.correspondingJson)
      .map(uploadFile => JSON.parse(uploadFile.correspondingJson!));

    // Call the backend service
    this.bulkUploadService.bulkUpload(files, annotations).subscribe({
      next: (result) => {
        this.isProcessing = false;
        this.processingSuccess = true;
        this.processingResult = result;
        console.log('Bulk upload completed:', result);
      },
      error: (error) => {
        this.isProcessing = false;
        console.error('Bulk upload error:', error);
        
        if (error.status === 401) {
          this.processingError = 'Session expirée. Veuillez vous reconnecter.';
        } else if (error.status === 400) {
          this.processingError = error.error?.message || 'Erreur de validation des fichiers.';
        } else if (error.status === 0) {
          this.processingError = 'Impossible de se connecter au serveur. Vérifiez votre connexion.';
        } else {
          this.processingError = error.error?.message || 'Erreur lors de l\'upload en lot.';
        }
      }
    });
  }

  clearAll() {
    this.uploadedFiles = [];
    this.processedJsonFiles = [];
    this.selectedJsonFile = null;
    this.jsonFileName = null;
    this.uploadError = null;
    this.uploadSuccess = false;
    this.jsonProcessingError = null;
    this.jsonProcessingSuccess = false;
    this.processingResult = null;
  }
} 