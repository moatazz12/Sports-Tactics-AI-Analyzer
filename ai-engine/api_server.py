from fastapi import FastAPI
from fastapi.responses import JSONResponse
import json
import os
import statistics
import math
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# =============================
# Configuration CORS
# =============================
origins = [
    "*",  # autorise tous les domaines (pour tests). Pour production, mettre le domaine exact de ton site.
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # domaines autorisés
    allow_credentials=True,      # autorise les cookies
    allow_methods=["*"],         # autorise GET, POST, PUT, DELETE…
    allow_headers=["*"],         # autorise tous les headers
)

BASE_DIR = "output_videos"
INPUT_DIR = "input_videos"

@app.get("/")
async def root():
    """Point d'entrée principal de l'API"""
    return {
        "message": "API d'analyse vidéo de football",
        "endpoints": {
            "/": "Cette page d'accueil",
            "/collect-files/": "Statistiques complètes de la vidéo",
            "/docs": "Documentation interactive de l'API"
        }
    }

@app.get("/collect-files/")
async def collect_files():
    """Collecte et retourne les statistiques pour toutes les vidéos dans input_videos.

    - Lit les fichiers sources sous output_videos pour calculer des métriques d'exemple
    - Crée une entrée de statistiques par vidéo détectée dans input_videos
    - Sauvegarde le résultat agrégé dans output_videos/files.json
    """
    try:
        # -------------------------
        # Charger rapport_defensif (optionnel) et indexer par id_sequence
        # -------------------------
        rapport_by_id = {}
        try:
            with open(os.path.join(BASE_DIR, "rapport_defensif.json"), "r", encoding="utf-8") as f:
                rapport_defensif_data = json.load(f)
            if isinstance(rapport_defensif_data, list):
                for entry in rapport_defensif_data:
                    if isinstance(entry, dict) and "id_sequence" in entry:
                        rapport_by_id[str(entry["id_sequence"])]=entry
            elif isinstance(rapport_defensif_data, dict):
                # Single dict without id: will be used as default fallback
                pass
        except FileNotFoundError:
            rapport_defensif_data = {}

        # Valeurs par défaut si aucune correspondance trouvée pour une vidéo
        default_prediction = rapport_defensif_data.get("prediction", "Inconnue") if isinstance(rapport_defensif_data, dict) else "Inconnue"
        default_confiance = rapport_defensif_data.get("confiance", 0.0) if isinstance(rapport_defensif_data, dict) else 0.0

        # ==============================
        # Préparation des résultats agrégés
        # ==============================

        # ==============================
        # Construire résultats par vidéo d'entrée
        # ==============================
        try:
            video_files = [f for f in os.listdir(INPUT_DIR) if f.lower().endswith((".mp4", ".avi", ".mov", ".mkv"))]
        except FileNotFoundError:
            video_files = []

        results = []
        if video_files:
            for video_file in video_files:
                video_id = os.path.splitext(video_file)[0]

                # Essayer de charger un fichier de caractéristiques dédié à la vidéo
                features_path = os.path.join(BASE_DIR, f"{video_id}_features.json")
                per_video_statistiques = None
                try:
                    with open(features_path, "r", encoding="utf-8") as ff:
                        features = json.load(ff)
                    frames_local = features.get("frames", [])

                    # Nb joueurs détectés (moyenne)
                    nb_joueurs_detectes_local = int(statistics.mean([len(f.get("joueurs", [])) for f in frames_local])) if frames_local else 0

                    # Vitesse moyenne approximative (premier joueur comme porteur proxy)
                    vitesse_moyenne_local = None
                    if len(frames_local) > 1 and frames_local[0].get("joueurs"):
                        vitesses = []
                        prev = frames_local[0]["joueurs"][0]
                        prev_t = frames_local[0].get("temps", 0)
                        for frame in frames_local[1:]:
                            if frame.get("joueurs"):
                                joueur = frame["joueurs"][0]
                                dx = joueur["x"] - prev["x"]
                                dy = joueur["y"] - prev["y"]
                                dt = max(1e-6, frame.get("temps", 0) - prev_t)
                                vitesses.append(math.sqrt(dx**2 + dy**2) / dt)
                                prev, prev_t = joueur, frame.get("temps", prev_t)
                        if vitesses:
                            vitesse_moyenne_local = round(statistics.mean(vitesses), 2)

                    # Zone du ballon (proxy: x du 1er joueur, largeur fictive)
                    zone_ballon_local = "Inconnue"
                    if frames_local and frames_local[0].get("joueurs"):
                        terrain_width = 2000
                        x = frames_local[0]["joueurs"][0]["x"]
                        ratio = x / max(1, terrain_width)
                        if ratio < 0.33:
                            zone_ballon_local = "Défense"
                        elif ratio < 0.66:
                            zone_ballon_local = "Milieu"
                        else:
                            zone_ballon_local = "Attaque"

                    # Possession (proxy: comptage des joueurs par équipe sur toutes les frames)
                    team1, team2 = 0, 0
                    for frame in frames_local:
                        for joueur in frame.get("joueurs", []):
                            if joueur.get("team") == 1:
                                team1 += 1
                            elif joueur.get("team") == 2:
                                team2 += 1
                    total_players = team1 + team2
                    possession_local = {
                        "equipe_A": round((team1 / total_players) * 100, 1) if total_players > 0 else 0,
                        "equipe_B": round((team2 / total_players) * 100, 1) if total_players > 0 else 0,
                    }

                    # Passes réussies (proxy: même équipe pour porteur consécutif)
                    passes_reussies_local = 0
                    last_team_local = None
                    for frame in frames_local:
                        if frame.get("joueurs"):
                            porteur = frame["joueurs"][0]
                            team = 1 if porteur.get("team") == 1 else 2
                            if last_team_local and team == last_team_local:
                                passes_reussies_local += 1
                            last_team_local = team

                    # Intensité pressing (adversaires < 50 unités)
                    pressing_values_local = []
                    for frame in frames_local:
                        if frame.get("joueurs"):
                            porteur = frame["joueurs"][0]
                            team_porteur = porteur.get("team")
                            proches = 0
                            for joueur in frame["joueurs"][1:]:
                                if joueur.get("team") != team_porteur:
                                    dist = math.sqrt((joueur["x"] - porteur["x"])**2 + (joueur["y"] - porteur["y"])**2)
                                    if dist < 50:
                                        proches += 1
                            pressing_values_local.append(proches)
                    intensite_pressing_local = round(statistics.mean(pressing_values_local), 2) if pressing_values_local else 0

                    # Prediction & confiance (par id_sequence si disponible)
                    prediction_local = "Inconnue"
                    confiance_local = 0.0
                    if 'rapport_by_id' in locals() and isinstance(rapport_by_id, dict):
                        # correspondances directes ou préfixes
                        entry = None
                        if video_id in rapport_by_id:
                            entry = rapport_by_id[video_id]
                        else:
                            # tenter correspondances approximatives
                            for key, val in rapport_by_id.items():
                                if str(key).startswith(video_id) or str(video_id).startswith(str(key)):
                                    entry = val
                                    break
                        if entry:
                            prediction_local = entry.get("prediction", "Inconnue")
                            confiance_local = entry.get("confiance", 0.0)
                    elif isinstance(rapport_defensif_data, dict):
                        prediction_local = default_prediction
                        confiance_local = default_confiance

                    per_video_statistiques = {
                        "id_sequence": video_id,
                        "nb_joueurs_detectes": nb_joueurs_detectes_local,
                        "possession": possession_local,
                        "zone_ballon": zone_ballon_local,
                        "vitesse_moyenne_ballon": vitesse_moyenne_local,
                        "passes_reussies": passes_reussies_local,
                        "intensite_pressing": intensite_pressing_local,
                        "prediction": prediction_local,
                        "confiance": confiance_local,
                    }
                except FileNotFoundError:
                    # Aucun features pour cette vidéo → ignorer (éviter résultats statiques)
                    continue

                # Sauvegarde par vidéo
                try:
                    per_video_output = os.path.join(BASE_DIR, f"{video_id}_stats.json")
                    with open(per_video_output, "w", encoding="utf-8") as pf:
                        json.dump({"statistiques": per_video_statistiques}, pf, ensure_ascii=False, indent=4)
                except Exception:
                    pass

                results.append({"statistiques": per_video_statistiques})
        else:
            # Aucun fichier vidéo détecté
            results = []

        final_payload = {"results": results}

        # Sauvegarde sous output_videos/files.json
        output_path = os.path.join(BASE_DIR, "files.json")
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(final_payload, f, ensure_ascii=False, indent=4)

        return JSONResponse(content=final_payload)
        
    except FileNotFoundError as e:
        return JSONResponse(
            status_code=404,
            content={
                "error": "Fichiers de données non trouvés",
                "message": f"Assurez-vous que les fichiers suivants existent dans {BASE_DIR}:",
                "required_files": [
                    "detections.json",
                    "sequence_meta.json", 
                    "rapport_defensif.json"
                ],
                "details": str(e)
            }
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "error": "Erreur interne du serveur",
                "message": str(e)
            }
        )

@app.get("/health/")
async def health_check():
    """Vérification de l'état du serveur"""
    return {
        "status": "healthy",
        "message": "API d'analyse vidéo opérationnelle"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
