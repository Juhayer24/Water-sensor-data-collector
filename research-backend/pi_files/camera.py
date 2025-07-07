from picamera2 import Picamera2
import cv2 as cv
import time
from datetime import datetime
import numpy as np
import base64

class VideoCamera(object):
    def __init__(self, flip=False, file_type=".jpg", photo_string="stream_photo"):
        self.picam2 = Picamera2()
        self.picam2.configure(self.picam2.create_preview_configuration(main={"format": "RGB888", "size": (640, 480)}))
        self.picam2.start()
        self.flip = flip
        self.file_type = file_type
        self.photo_string = photo_string
        time.sleep(2.0)

    def __del__(self):
        self.picam2.stop()

    def flip_if_needed(self, frame):
        if self.flip:
            return np.flip(frame, 0)
        return frame

    def get_frame(self):
        frame = self.flip_if_needed(self.picam2.capture_array())
        ret, jpeg = cv.imencode(self.file_type, frame)
        self.previous_frame = jpeg
        return jpeg.tobytes()

    def take_picture(self):
        frame = self.flip_if_needed(self.picam2.capture_array())
        today_date = datetime.now().strftime("%m%d%Y-%H%M%S")
        cv.imwrite(f"{self.photo_string}_{today_date}{self.file_type}", frame)
            
    def capture_image(self):
        frame = self.flip_if_needed(self.picam2.capture_array())
        
        #Encoding to send through JSON File
        
        _, image_encoded = cv.imencode('.png', frame)
        image_base64 = base64.b64encode(image_encoded).decode('utf-8') 

        return image_base64