from flask import Flask, render_template, Response, request, send_from_directory, jsonify
from camera import VideoCamera
import os

pi_camera = VideoCamera(flip=False)

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

def gen(camera):
    while True:
        frame = camera.get_frame()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n\r\n')

@app.route('/video_feed')
def video_feed():
    return Response(gen(pi_camera),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/picture', methods=['POST'])
def take_picture():#Change this to "Go Next"
    pi_camera.take_picture()
    return "None"

@app.route('/get_images', methods=['POST'])
def get_images():
    try:
        data=request.get_json()
        print("received data", data)
    
        image = pi_camera.capture_image()
        
        
        files = {'image': image}
        return jsonify(files), 200 
    
    except Exception as e:
        print(e)
        return jsonify({"message": str(e)}), 200    

if __name__ == '__main__':


    #need to refactor to not hard code in IP adress
    app.run(host='10.4.119.62', debug=False, port=5000)