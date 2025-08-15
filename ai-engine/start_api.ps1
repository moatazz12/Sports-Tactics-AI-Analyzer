# Script PowerShell pour démarrer l'API automatiquement
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   DEMARRAGE AUTOMATIQUE DE L'API" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérification de Python
Write-Host "[1/4] Vérification de Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python détecté: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ ERREUR: Python n'est pas installé ou pas dans le PATH" -ForegroundColor Red
    Read-Host "Appuyez sur Entrée pour quitter"
    exit 1
}

Write-Host ""
Write-Host "[2/4] Installation des packages requis..." -ForegroundColor Yellow
try {
    pip install fastapi uvicorn --quiet
    Write-Host "✅ Packages installés avec succès" -ForegroundColor Green
} catch {
    Write-Host "❌ ERREUR: Impossible d'installer les packages" -ForegroundColor Red
    Read-Host "Appuyez sur Entrée pour quitter"
    exit 1
}

Write-Host ""
Write-Host "[3/4] Vérification des fichiers requis..." -ForegroundColor Yellow

if (-not (Test-Path "api_server.py")) {
    Write-Host "❌ ERREUR: Fichier api_server.py non trouvé" -ForegroundColor Red
    Read-Host "Appuyez sur Entrée pour quitter"
    exit 1
}

if (-not (Test-Path "output_videos")) {
    Write-Host "⚠️ ATTENTION: Dossier output_videos non trouvé" -ForegroundColor Yellow
    Write-Host "Création du dossier..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "output_videos" -Force
}

Write-Host "✅ Fichiers vérifiés" -ForegroundColor Green

Write-Host ""
Write-Host "[4/4] Démarrage du serveur API..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   SERVEUR API EN COURS DE DÉMARRAGE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "URLs disponibles:" -ForegroundColor Green
Write-Host "  - Accueil: http://localhost:8000/" -ForegroundColor White
Write-Host "  - Statistiques: http://localhost:8000/collect-files/" -ForegroundColor White
Write-Host "  - Documentation: http://localhost:8000/docs" -ForegroundColor White
Write-Host "  - Santé: http://localhost:8000/health/" -ForegroundColor White
Write-Host ""
Write-Host "Appuyez sur Ctrl+C pour arrêter le serveur" -ForegroundColor Yellow
Write-Host ""

# Démarrer le serveur
python api_server.py

Write-Host ""
Write-Host "Serveur arrêté." -ForegroundColor Red
Read-Host "Appuyez sur Entrée pour quitter"
