#!/usr/bin/env python3
"""
Script automatique pour démarrer l'API d'analyse vidéo
Ce script installe automatiquement les dépendances et lance le serveur
"""

import subprocess
import sys
import os
import time

def print_banner():
    """Affiche la bannière de démarrage"""
    print("=" * 50)
    print("   DÉMARRAGE AUTOMATIQUE DE L'API")
    print("   Analyse Vidéo de Football")
    print("=" * 50)
    print()

def check_python():
    """Vérifie que Python est disponible"""
    print("[1/4] Vérification de Python...")
    try:
        result = subprocess.run([sys.executable, "--version"], 
                               capture_output=True, text=True, check=True)
        print(f"✅ Python détecté: {result.stdout.strip()}")
        return True
    except Exception as e:
        print(f"❌ ERREUR: Python non disponible - {e}")
        return False

def install_packages():
    """Installe les packages requis"""
    print("\n[2/4] Installation des packages requis...")
    packages = ["fastapi", "uvicorn"]
    
    for package in packages:
        try:
            print(f"   Installation de {package}...")
            subprocess.run([sys.executable, "-m", "pip", "install", package, "--quiet"], 
                         check=True)
            print(f"   ✅ {package} installé")
        except subprocess.CalledProcessError:
            print(f"   ⚠️ {package} déjà installé ou erreur d'installation")
    
    return True

def check_files():
    """Vérifie que les fichiers requis existent"""
    print("\n[3/4] Vérification des fichiers requis...")
    
    required_files = ["api_server.py"]
    missing_files = []
    
    for file in required_files:
        if not os.path.exists(file):
            missing_files.append(file)
        else:
            print(f"   ✅ {file} trouvé")
    
    if missing_files:
        print(f"❌ Fichiers manquants: {missing_files}")
        return False
    
    # Créer le dossier output_videos s'il n'existe pas
    if not os.path.exists("output_videos"):
        print("   📁 Création du dossier output_videos...")
        os.makedirs("output_videos", exist_ok=True)
        print("   ✅ Dossier output_videos créé")
    
    return True

def start_server():
    """Démarre le serveur API"""
    print("\n[4/4] Démarrage du serveur API...")
    print()
    print("=" * 50)
    print("   SERVEUR API EN COURS DE DÉMARRAGE")
    print("=" * 50)
    print()
    print("🌐 URLs disponibles:")
    print("   • Accueil: http://localhost:8000/")
    print("   • Statistiques: http://localhost:8000/collect-files/")
    print("   • Documentation: http://localhost:8000/docs")
    print("   • Santé: http://localhost:8000/health/")
    print()
    print("⚠️  Appuyez sur Ctrl+C pour arrêter le serveur")
    print()
    
    try:
        # Lancer le serveur
        subprocess.run([sys.executable, "api_server.py"], check=True)
    except KeyboardInterrupt:
        print("\n🛑 Arrêt du serveur demandé par l'utilisateur")
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Erreur lors du démarrage du serveur: {e}")
    except Exception as e:
        print(f"\n❌ Erreur inattendue: {e}")

def main():
    """Fonction principale"""
    print_banner()
    
    # Vérifications
    if not check_python():
        input("Appuyez sur Entrée pour quitter...")
        return
    
    if not install_packages():
        input("Appuyez sur Entrée pour quitter...")
        return
    
    if not check_files():
        input("Appuyez sur Entrée pour quitter...")
        return
    
    # Démarrage du serveur
    start_server()
    
    print("\n✅ Script terminé")
    input("Appuyez sur Entrée pour quitter...")

if __name__ == "__main__":
    main()
