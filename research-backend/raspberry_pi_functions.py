from flask import Flask, request
from flask_cors import CORS
import requests
import base64
from io import BytesIO
from PIL import Image
import time
import threading
from bson.objectid import ObjectId
from ml_scripts import get_inference

app = Flask(__name__)
CORS(app)

def decode_image(encoded_img):
    
    img_str = base64.b64decode(encoded_img)
    img_file = BytesIO(img_str)
    img = Image.open(img_file)

    return img

@app.route('/send_dur_and_freq', methods=['POST'])
def sending_data(stoping, duration, frequency):

    url = 'http://10.4.119.62:5000/get_images'#Need to amke dynamic with difference cameras ips, miht need to write script to make the ip static in server.sh
    data = {'duration': duration, 'frequency': frequency}
    headers = {'Content-Type': 'application/json'}
    
    if duration != None:
        try:
            number_of_images = (duration*frequency)
            for i in range(number_of_images+1):

                if stoping.is_set():
                    return "Stopped Early"
                
                #Turn On LED

                response = requests.post(url, json=data, headers=headers)
                image = decode_image(encoded_img=response.json()['image'])
                image.save(f"images/image_{i}.png")
                
                #turn off LED

                if i != number_of_images:
                    time.sleep(((1/frequency)*60)-.1)#needs to sleep for that amount of time in the code for LED to turn on
            
            print("done")
            return "Received Message"

        except requests.exceptions.RequestException as e:
            print(e)
            return f"Error sending data: {e}", 500

    else:
        while True:
            print(duration, frequency)
            if stoping.is_set():
                    return "Stopped Early"
                
                #Turn On LED

            response = requests.post(url, json=data, headers=headers)
            image = decode_image(encoded_img=response.json()['image'])
            result = get_inference(image)

            if result != "Clean":
                return result
                
                #turn off LED

            if i != number_of_images:
                time.sleep(((1/frequency)*360)-.1)


@app.route("/stop")
def stop():
    global stop_pictures
    stop_pictures.set()
    return "Stopped"



@app.route("/start", methods=["POST"])
def start():
        
    data = request.get_json()
    duration = data.get("duration")
    frequency = data.get("frequency")

    global thread, stop_pictures
    if thread is None or not thread.is_alive():
        stop_pictures.clear()
        thread = threading.Thread(target=sending_data, args=(stop_pictures, duration, frequency))
        thread.start()
        
    return "started"