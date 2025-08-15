import cv2
import numpy as np
from sklearn.cluster import KMeans

class ColorAssigner:
    def __init__(self, n_clusters=2):
        self.n_clusters = n_clusters

    def load_image(self, image_path):
        image = cv2.imread(image_path)
        if image is None:
            raise FileNotFoundError(f"Image not found at path: {image_path}")
        return cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    def extract_top_half(self, image):
        return image[0: int(image.shape[0] / 2), :]

    def cluster_image(self, image):
        image_2d = image.reshape(-1, 3)
        kmeans = KMeans(n_clusters=self.n_clusters, random_state=0)
        kmeans.fit(image_2d)
        labels = kmeans.labels_.reshape(image.shape[0], image.shape[1])
        return kmeans, labels

    def get_player_cluster(self, clustered_image):
        corner_clusters = [
            clustered_image[0, 0], clustered_image[0, -1],
            clustered_image[-1, 0], clustered_image[-1, -1]
        ]
        non_player_cluster = max(set(corner_clusters), key=corner_clusters.count)
        player_cluster = 1 - non_player_cluster
        return player_cluster

    def get_cluster_color(self, kmeans, cluster_id):
        return kmeans.cluster_centers_[cluster_id]
