import sys 
sys.path.append('../')
from utils import get_center_of_bbox, measure_distance

class PlayerBallAssigner():
    def __init__(self):
        self.max_player_ball_distance = 70  # Seuil ajustable selon la résolution vidéo

    def assign_ball_to_player(self, players, ball_bbox):
        ball_position = get_center_of_bbox(ball_bbox)

        min_distance = float('inf')
        assigned_player = -1

        for player_id, player in players.items():
            if 'bbox' not in player or not player['bbox']:
                continue  # Sauter les joueurs sans bbox valide

            player_position = get_center_of_bbox(player['bbox'])
            distance = measure_distance(player_position, ball_position)

            if distance < self.max_player_ball_distance and distance < min_distance:
                min_distance = distance
                assigned_player = player_id

        return assigned_player
