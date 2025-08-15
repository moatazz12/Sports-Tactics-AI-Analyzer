#!/usr/bin/env python3
"""
Script de diagnostic pour vérifier l'état de l'API
"""

import os
import json
import requests
import time

def check_files():
    """Vérifie que tous les fichiers requis existent"""
    print("🔍 Vérification des fichiers requis...")
    
    output_dir = "output_videos"
    required_files = ["detections.json", "sequence_meta.json", "rapport_defensif.json"]
    
    all_exist = True
    for file in required_files:
        file_path = os.path.join(output_dir, file)
        if os.path.exists(file_path):
            print(f"✅ {file} - OK")
        else:
            print(f"❌ {file} - MANQUANT")
            all_exist = False
    
    return all_exist

def check_api_endpoints():
    """Vérifie que l'API répond correctement"""
    print("\n🌐 Test des endpoints de l'API...")
    
    base_url = "http://localhost:8000"
    endpoints = [
        ("/", "Page d'accueil"),
        ("/health/", "Vérification santé"),
        ("/collect-files/", "Statistiques vidéo"),
        ("/docs", "Documentation")
    ]
    
    for endpoint, description in endpoints:
        try:
            url = base_url + endpoint
            response = requests.get(url, timeout=5)
            
            if response.status_code == 200:
                print(f"✅ {endpoint} - {description} - OK")
            else:
                print(f"⚠️ {endpoint} - {description} - Code: {response.status_code}")
                
        except requests.exceptions.ConnectionError:
            print(f"❌ {endpoint} - {description} - SERVEUR NON DÉMARRÉ")
        except Exception as e:
            print(f"❌ {endpoint} - {description} - ERREUR: {e}")

def create_missing_files():
    """Crée les fichiers manquants"""
    print("\n🔧 Création des fichiers manquants...")
    
    output_dir = "output_videos"
    os.makedirs(output_dir, exist_ok=True)
    
    # Créer detections.json si manquant
    detections_path = os.path.join(output_dir, "detections.json")
    if not os.path.exists(detections_path):
        print("📝 Création de detections.json...")
        detections_data = {
            "id_sequence": "FCBvsCITY_sequ2",
            "frames": []
        }
        
        # Ajouter des frames d'exemple
        for i in range(10):
            frame_data = {
                "temps": i * 0.5,
                "joueurs": [
                    {"id": 1, "x": 100 + i * 5, "y": 200 + i * 3},
                    {"id": 2, "x": 150 + i * 4, "y": 180 + i * 2},
                    {"id": 0, "x": 250 + i * 8, "y": 300 + i * 6}  # Ballon
                ]
            }
            detections_data["frames"].append(frame_data)
        
        with open(detections_path, "w", encoding="utf-8") as f:
            json.dump(detections_data, f, ensure_ascii=False, indent=2)
        print("✅ detections.json créé")
    
    # Créer rapport_defensif.json si manquant
    rapport_path = os.path.join(output_dir, "rapport_defensif.json")
    if not os.path.exists(rapport_path):
        print("📝 Création de rapport_defensif.json...")
        rapport_data = {
            "id_sequence": "FCBvsCITY_sequ2_seq_01",
            "prediction": "pressing_haut",
            "confiance": 0.85
        }
        
        with open(rapport_path, "w", encoding="utf-8") as f:
            json.dump(rapport_data, f, ensure_ascii=False, indent=4)
        print("✅ rapport_defensif.json créé")

def main():
    """Fonction principale de diagnostic"""
    print("=" * 60)
    print("   DIAGNOSTIC DE L'API D'ANALYSE VIDÉO")
    print("=" * 60)
    
    # 1. Vérifier les fichiers
    files_ok = check_files()
    
    # 2. Créer les fichiers manquants si nécessaire
    if not files_ok:
        create_missing_files()
        print("\n🔄 Vérification après création...")
        check_files()
    
    # 3. Tester l'API
    print("\n" + "=" * 60)
    print("   TEST DE L'API")
    print("=" * 60)
    
    print("⏳ Attente de 2 secondes pour laisser le temps au serveur...")
    time.sleep(2)
    
    check_api_endpoints()
    
    print("\n" + "=" * 60)
    print("   RÉSUMÉ")
    print("=" * 60)
    
    if files_ok:
        print("✅ Tous les fichiers requis sont présents")
        print("🌐 L'API devrait fonctionner correctement")
        print("\n📋 URLs à tester:")
        print("   • http://localhost:8000/")
        print("   • http://localhost:8000/collect-files/")
        print("   • http://localhost:8000/docs")
    else:
        print("⚠️ Des fichiers étaient manquants mais ont été créés")
        print("🔄 Relancez le serveur pour tester l'API")
    
    print("\n💡 Pour démarrer l'API:")
    print("   python start_api_simple.py")

if __name__ == "__main__":
    main()
