from sklearn.cluster import KMeans
from color_assigner.color_assigner import ColorAssigner
import numpy as np

class TeamAssigner:
    def __init__(self):
        """
        Initializes the TeamAssigner with a ColorAssigner and KMeans model.
        """
        self.color_assigner = ColorAssigner(n_clusters=2)
        self.team_colors = {}
        self.player_team_dict = {}
        self.kmeans = None
    
    def get_clustering_model(self, image):
        """
        Creates a KMeans clustering model for the given image.
        Args:
            image (ndarray): Image to cluster.
        Returns:
            KMeans: Trained KMeans model.
        """
        # Reshape the image to 2D array
        image_2d = image.reshape(-1,3)

        # Preform K-means with 2 clusters
        kmeans = KMeans(n_clusters=2, init="k-means++",n_init=1)
        kmeans.fit(image_2d)

        return kmeans

    def get_player_color(self, frame, bbox):
        """
        Extracts the dominant color of a player's bounding box.
        Args:
            frame (ndarray): Frame containing the player.
            bbox (list): Bounding box of the player.
        Returns:
            ndarray: Dominant color of the player.
        """
        image = frame[int(bbox[1]):int(bbox[3]),int(bbox[0]):int(bbox[2])]

        top_half_image = image[0:int(image.shape[0]/2),:]

        # Get Clustering model
        kmeans = self.get_clustering_model(top_half_image)

        # Get the cluster labels forr each pixel
        labels = kmeans.labels_

        # Reshape the labels to the image shape
        clustered_image = labels.reshape(top_half_image.shape[0],top_half_image.shape[1])

        # Get the player cluster
        corner_clusters = [clustered_image[0,0],clustered_image[0,-1],clustered_image[-1,0],clustered_image[-1,-1]]
        non_player_cluster = max(set(corner_clusters),key=corner_clusters.count)
        player_cluster = 1 - non_player_cluster

        player_color = kmeans.cluster_centers_[player_cluster]

        return player_color


    def assign_team_color(self, frame, player_detections):
        """
        Assigns team colors based on player detections in the first frame.
        Args:
            frame (ndarray): First frame of the video.
            player_detections (dict): Dictionary of player detections.
        """
        player_colors = []
        for _, player_detection in player_detections.items():
            bbox = player_detection["bbox"]
            player_color =  self.get_player_color(frame,bbox)
            player_colors.append(player_color)
        
        kmeans = KMeans(n_clusters=2, init="k-means++", n_init=10)
        kmeans.fit(player_colors)

        self.kmeans = kmeans

        # Assign team colors with keys 1 and 2
        self.team_colors[1] = kmeans.cluster_centers_[0]
        self.team_colors[2] = kmeans.cluster_centers_[1]


    def get_player_team(self, frame, player_bbox, player_id):
        """
        Predicts the team of a player based on their color.
        Args:
            frame (ndarray): Frame containing the player.
            player_bbox (list): Bounding box of the player.
            player_id (int): ID of the player.
        Returns:
            int: Team ID of the player.
        """
        if player_id in self.player_team_dict:
            return self.player_team_dict[player_id]

        player_color = self.get_player_color(frame,player_bbox)

        team_id = self.kmeans.predict(player_color.reshape(1,-1))[0]
        team_id+=1

        if player_id ==91:
            team_id=1

        self.player_team_dict[player_id] = team_id

        return team_id
    
    def reassign_teams(self, frame, player_detections):
        """
        Reassigns teams to players based on updated detections.
        Args:
            frame (ndarray): Current frame of the video.
            player_detections (dict): Dictionary of updated player detections.
        """
        player_colors = []
        for _, player_detection in player_detections.items():
            bbox = player_detection["bbox"]
            player_color =  self.get_player_color(frame,bbox)
            player_colors.append(player_color)
        
        # Predict the teams for the current player colors
        predicted_teams = self.kmeans.predict(player_colors)

        # Update the team_colors dictionary
        for i, team_id in enumerate(predicted_teams):
            self.team_colors[team_id] = player_colors[i]

        # Update the player_team_dict with new assignments
        for i, player_detection in player_detections.items():
            self.player_team_dict[i] = predicted_teams[int(i)] + 1
        # Update the player_team_dict with new assignments
        for i, player_detection in player_detections.items():
            self.player_team_dict[i] = predicted_teams[int(i)] + 1
