@echo off
echo ========================================
echo    DEMARRAGE AUTOMATIQUE DE L'API
echo ========================================
echo.

echo [1/4] Verification de Python...
python --version
if %errorlevel% neq 0 (
    echo ERREUR: Python n'est pas installe ou pas dans le PATH
    pause
    exit /b 1
)

echo.
echo [2/4] Installation des packages requis...
pip install fastapi uvicorn --quiet
if %errorlevel% neq 0 (
    echo ERREUR: Impossible d'installer les packages
    pause
    exit /b 1
)

echo.
echo [3/4] Verification des fichiers requis...
if not exist "api_server.py" (
    echo ERREUR: Fichier api_server.py non trouve
    pause
    exit /b 1
)

if not exist "output_videos" (
    echo ATTENTION: Dossier output_videos non trouve
    echo Creation du dossier...
    mkdir output_videos
)

echo.
echo [4/4] Demarrage du serveur API...
echo.
echo ========================================
echo    SERVEUR API EN COURS DE DEMARRAGE
echo ========================================
echo.
echo URLs disponibles:
echo   - Accueil: http://localhost:8000/
echo   - Statistiques: http://localhost:8000/collect-files/
echo   - Documentation: http://localhost:8000/docs
echo   - Sante: http://localhost:8000/health/
echo.
echo Appuyez sur Ctrl+C pour arreter le serveur
echo.

python api_server.py

echo.
echo Serveur arrete.
pause
