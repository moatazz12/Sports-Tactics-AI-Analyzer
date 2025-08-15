import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface JsonObject {
  id_sequence: string;
  annotation: string;
  validateur: string;
  date_annotation: string;
  commentaire: string;
}

@Component({
  selector: 'app-json-splitter',
  imports: [CommonModule],
  templateUrl: './json-splitter.html',
  styleUrl: './json-splitter.css'
})
export class JsonSplitter {
  selectedFile: File | null = null;
  fileName: string | null = null;
  isProcessing = false;
  processingError: string | null = null;
  processingSuccess = false;
  processedFiles: { filename: string; content: string }[] = [];

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validate file type
      if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        this.processingError = 'Veuillez sélectionner un fichier JSON valide.';
        return;
      }

      this.selectedFile = file;
      this.fileName = file.name;
      this.processingError = null;
      this.processingSuccess = false;
      this.processedFiles = [];
    } else {
      this.clearSelection();
    }
  }

  processJsonFile() {
    if (!this.selectedFile) {
      this.processingError = 'Aucun fichier sélectionné';
      return;
    }

    this.isProcessing = true;
    this.processingError = null;
    this.processingSuccess = false;
    this.processedFiles = [];

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const jsonData = JSON.parse(content);
        
        // Check if it's an array
        if (!Array.isArray(jsonData)) {
          this.processingError = 'Le fichier JSON doit contenir un tableau d\'objets.';
          this.isProcessing = false;
          return;
        }

        // Process each object
        this.splitJsonObjects(jsonData);
        
        this.isProcessing = false;
        this.processingSuccess = true;
        
      } catch (error) {
        this.isProcessing = false;
        this.processingError = 'Erreur lors du parsing du fichier JSON. Vérifiez que le fichier est valide.';
        console.error('JSON parsing error:', error);
      }
    };

    reader.onerror = () => {
      this.isProcessing = false;
      this.processingError = 'Erreur lors de la lecture du fichier.';
    };

    reader.readAsText(this.selectedFile);
  }

  private splitJsonObjects(jsonArray: JsonObject[]) {
    const processedFiles: { filename: string; content: string }[] = [];
    let validCount = 0;
    let invalidCount = 0;

    jsonArray.forEach((obj, index) => {
      // Check if object has required fields
      if (!obj.id_sequence) {
        console.warn(`Object at index ${index} missing id_sequence, skipping...`);
        invalidCount++;
        return;
      }

      if (!obj.annotation) {
        console.warn(`Object at index ${index} missing annotation, skipping...`);
        invalidCount++;
        return;
      }

      if (!obj.validateur) {
        console.warn(`Object at index ${index} missing validateur, skipping...`);
        invalidCount++;
        return;
      }

      // Create filename from id_sequence
      const filename = `${obj.id_sequence}.json`;
      
      // Create JSON content for this object with proper formatting
      const jsonContent = JSON.stringify(obj, null, 2);
      
      processedFiles.push({
        filename,
        content: jsonContent
      });
      
      validCount++;
    });

    this.processedFiles = processedFiles;
    
    if (invalidCount > 0) {
      console.warn(`${invalidCount} objects were skipped due to missing required fields`);
    }
    
    console.log(`Successfully processed ${validCount} objects into individual files`);
  }

  downloadAllFiles() {
    if (this.processedFiles.length === 0) {
      return;
    }

    // Download each file individually
    this.processedFiles.forEach(file => {
      this.downloadFile(file.filename, file.content);
    });
  }

  downloadFile(filename: string, content: string) {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
  }

  downloadSingleFile(filename: string, content: string) {
    this.downloadFile(filename, content);
  }

  clearSelection() {
    this.selectedFile = null;
    this.fileName = null;
    this.processingError = null;
    this.processingSuccess = false;
    this.processedFiles = [];
  }

  // Check if processing should be disabled
  isProcessingDisabled(): boolean {
    return !this.selectedFile || this.isProcessing;
  }

  // Get processing status message
  getProcessingStatusMessage(): string {
    if (this.isProcessing) {
      return '⏳ Traitement en cours...';
    }
    if (this.processingSuccess) {
      return `✅ ${this.processedFiles.length} fichiers créés avec succès!`;
    }
    if (this.processingError) {
      return `❌ ${this.processingError}`;
    }
    return '📁 Sélectionnez un fichier JSON à traiter';
  }
} 