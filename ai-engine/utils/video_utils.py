import cv2

def read_video(video_path):
    """
    Reads a video file and extracts all frames as a list of images.

    Args:
        video_path (str): Path to the video file.

    Returns:
        list: List of frames (images) from the video.
    """
    cap = cv2.VideoCapture(video_path)
    frames = []
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        frames.append(frame)
    return frames

def save_video(ouput_video_frames, output_video_path):
    """
    Saves a list of frames as a video file.

    Args:
        ouput_video_frames (list): List of frames to save as a video.
        output_video_path (str): Path to save the output video.
    """
    fourcc = cv2.VideoWriter_fourcc(*'XVID')
    out = cv2.VideoWriter(output_video_path, fourcc, 24, (ouput_video_frames[0].shape[1], ouput_video_frames[0].shape[0]))
    for frame in ouput_video_frames:
        out.write(frame)
    out.release()
