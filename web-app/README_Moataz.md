## Guide de démarrage — Tactical Annotation App

Cette documentation explique comment installer et lancer le projet (Backend NestJS, Frontend Angular) ainsi que le serveur IA Python nécessaire à l'AI Viewer. Elle décrit aussi le flux d’annotation assistée par IA (upload → AI Viewer → statistiques).

### Prérequis
- Node.js LTS et npm
- Python 3.x et pip
- Angular CLI (global) recommandé: `npm i -g @angular/cli`

### Ports et URLs utilisés
- Backend (NestJS): `http://localhost:3000`
  - Fichiers uploadés servis statiquement sous `http://localhost:3000/uploads`
- Frontend (Angular): `http://localhost:4200`
- Serveur IA (Python): `http://localhost:8000`

Les URLs utilisées côté Frontend sont définies dans `Frontend/src/app/services/video.service.ts`:

```24:31:Frontend/src/app/services/video.service.ts
export class VideoService {
  private apiUrl = 'http://localhost:3000/video';
  private aiApiBaseUrl = 'http://localhost:8000';
  private uploadsBaseUrl = 'http://localhost:3000/uploads';
}
```

Le Backend sert les fichiers uploadés et active CORS pour l’UI:

```15:34:Backend/src/main.ts
app.enableCors({ origin: 'http://localhost:4200', credentials: true });
app.use('/uploads', express.static(join(process.cwd(), 'uploads')));
await app.listen(3000);
```

---

## Installation

1) Installer les dépendances Backend
- Ouvrir un terminal dans `Backend/`
- Exécuter: `npm install`

2) Installer les dépendances Frontend
- Ouvrir un terminal dans `Frontend/`
- Exécuter: `npm install`

3) Installer les dépendances du serveur IA
- Aller dans le dossier du modèle IA ("dossier final model") qui contient `api_server.py`
- Créer/activer votre venv si besoin, puis installer les requirements (ex.: `pip install -r requirements.txt`)

Note: Vérifier la configuration de base de données Prisma si applicable (fichier `.env` dans `Backend/`). Le projet utilise Prisma; assurez-vous que le provider/URL sont corrects pour votre environnement.

---

## Lancement des services

1) Démarrer le Backend (NestJS)
- Dans `Backend/`:
  - Développement: `npm run start:dev`
  - Production (à partir du build): `npm run build && npm run start:prod`

2) Démarrer le serveur IA (Python)
- Aller dans le dossier « final model » (le dossier qui contient `api_server.py`)
- Lancer: `python api_server.py`
- Le serveur doit écouter sur `http://localhost:8000`

3) Démarrer le Frontend (Angular)
- Dans `Frontend/`:
  - `ng serve`
- Ouvrir le navigateur: `http://localhost:4200`

Astuce Windows: vous pouvez aussi utiliser `Backend/start-backend.bat` si fourni, sinon lancez les commandes ci-dessus manuellement.

---

## Flux: Upload vidéo → Annotation IA → AI Viewer

### 1) Authentification
- Connectez-vous depuis l’UI (`/login`). Les requêtes d’upload nécessitent un JWT (injecté automatiquement via `Authorization: Bearer ...`).

### 2) Upload de la vidéo
- Depuis la page `Auto-annotation` (route `/auto-annotation`), sélectionnez un fichier vidéo puis cliquez sur « Upload ».
- Le Frontend envoie un POST vers le Backend:

```51:59:Backend/src/video/video.controller.ts
@Post('uploadVideo')
@UseInterceptors(FileInterceptor('video'))
async uploadVideo(@UploadedFile() file: UploadedFileType) {
  if (!file) throw new BadRequestException('No video file uploaded');
  const video = await this.videoService.uploadVideo(file);
  return { status: 'success', data: video };
}
```

### 3) Génération de l'identifiant `id_sequence`
- L’`id_sequence` est dérivé du nom de fichier (sans extension, nettoyage des suffixes ` (n)` éventuels). Il est utilisé pour faire correspondre la vidéo aux statistiques IA.

```82:96:Frontend/src/app/services/video.service.ts
generateIdSequence(filename: string): string {
  let base = filename.replace(/\.[^/.]+$/, '');
  base = base.replace(/\s*\(\d+\)$/, '');
  return base.trim();
}
```

### 4) Navigation vers l’AI Viewer
- Après l’upload, cliquez sur « Prédire » (ou bouton équivalent) pour ouvrir l’AI Viewer.
- La navigation passe l’URL de lecture et l’`id_sequence` au composant AI Viewer.

```120:137:Frontend/src/app/video/video.ts
predict() {
  const state: any = {};
  if (this.videoPreviewUrl) state.videoUrl = this.videoPreviewUrl;
  if (this.fileName) state.fileName = this.fileName;
  const idSequence = this.getIdSequence();
  if (!idSequence) { this.predictError = 'Aucune vidéo valide...'; return; }
  state.idSequence = idSequence;
  this.router.navigate(['/ai-viewer'], { state });
}
```

### 5) Lecture vidéo via l’URL serveur
- Si le nom de fichier uploadé est connu, l’AI Viewer privilégie l’URL publique servie par le Backend (`/uploads/<filename>`):

```30:35:Frontend/src/app/ai-viewer/ai-viewer.ts
if (this.uploadedFileName) {
  const candidate = this.videoService.getUploadsFileUrl(this.uploadedFileName);
  if (candidate) this.videoUrl = candidate;
}
```

### 6) Récupération des statistiques IA
- L’AI Viewer interroge le serveur IA Python sur `http://localhost:8000` via:
  - `GET /collect-files/` (liste) et filtre localement par `id_sequence`

```98:106:Frontend/src/app/services/video.service.ts
getAiStatistics(): Observable<any> {
  return this.http.get(`${this.aiApiBaseUrl}/collect-files/`);
}
getAiStatisticsById(idSequence: string): Observable<any> {
  return this.http.get(`${this.aiApiBaseUrl}/collect-files/${encodeURIComponent(idSequence)}`);
}
```

Le composant AI Viewer gère plusieurs formats de réponses possibles et sélectionne l’entrée correspondant à l’`id_sequence` attendu:

```69:116:Frontend/src/app/ai-viewer/ai-viewer.ts
fetchStats(): void {
  const expectedIdRaw = this.expectedIdSequence || (this.uploadedFileName ? String(this.uploadedFileName).replace(/\.[^/.]+$/, '') : null);
  const expectedId = expectedIdRaw ? this.videoService.generateIdSequence(expectedIdRaw) : null;
  this.videoService.getAiStatistics().subscribe({
    next: (data) => {
      let payload: any = data;
      if (payload && Array.isArray(payload.results)) payload = payload.results.map((r:any)=> r?.statistiques ?? r).filter((x:any)=>!!x);
      else if (payload && payload.statistiques) payload = payload.statistiques;
      this.rawResponse = payload;
      const normalize = (v:any)=> v==null? null : String(v).trim().toLowerCase().replace(/\s*\(\d+\)$/, '');
      const expectedIdNorm = normalize(expectedId);
      let selected: any|null = null;
      if (Array.isArray(payload)) selected = expectedIdNorm ? payload.find((it:any)=> normalize(it?.id_sequence)===expectedIdNorm) || null : (payload[0]||null);
      else selected = (!expectedIdNorm || !payload?.id_sequence || normalize(payload.id_sequence)===expectedIdNorm) ? payload : null;
      this.stats = selected;
    }
  });
}
```

---

## Dépannage rapide
- Erreur 401 à l’upload: reconnectez-vous (JWT expiré).
- Erreur de connexion à l’upload (status 0): vérifier que le Backend est démarré sur 3000.
- Statistiques vides dans l’AI Viewer: vérifier que le serveur IA (`api_server.py`) tourne sur 8000 et que l’`id_sequence` de la vidéo correspond aux données calculées par l’IA.
- Vidéo ne se lit pas dans l’AI Viewer: vérifier que `http://localhost:3000/uploads/<nom_fichier>` est accessible (droits, CORS, fichier présent sur disque).

---

## Résumé
- Lancer Backend (3000), Serveur IA Python (8000), puis Frontend (4200).
- Uploader une vidéo, puis « Prédire » pour ouvrir l’AI Viewer.
- L’AI Viewer lit la vidéo depuis `/uploads` et récupère les statistiques via l’API IA (`/collect-files/`).


