from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from pymongo import MongoClient
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

# Replace with your MongoDB URI if using Atlas
client = MongoClient("mongodb://localhost:27017")
db = client["mydb"]
systems_col = db["systems"]
users_col = db["users"]

PROFILE_PHOTO_DIR = os.path.join(os.path.dirname(__file__), 'profile_photos')
os.makedirs(PROFILE_PHOTO_DIR, exist_ok=True)

@app.route('/upload_profile_photo', methods=['POST'])
def upload_profile_photo():
    username = request.form.get('username')
    if 'photo' not in request.files or not username:
        return jsonify({'success': False, 'message': 'Photo and username required'}), 400
    file = request.files['photo']
    if file.filename == '':
        return jsonify({'success': False, 'message': 'No selected file'}), 400
    filename = secure_filename(f"{username}_profile_{file.filename}")
    filepath = os.path.join(PROFILE_PHOTO_DIR, filename)
    file.save(filepath)
    users_col.update_one({'username': username}, {'$set': {'profile_photo': filename}})
    return jsonify({'success': True, 'filename': filename})

@app.route('/remove_profile_photo', methods=['POST'])
def remove_profile_photo():
    data = request.get_json()
    username = data.get('username')
    user = users_col.find_one({'username': username})
    if not user or 'profile_photo' not in user:
        return jsonify({'success': False, 'message': 'No profile photo to remove'}), 400
    filename = user['profile_photo']
    filepath = os.path.join(PROFILE_PHOTO_DIR, filename)
    if os.path.exists(filepath):
        os.remove(filepath)
    users_col.update_one({'username': username}, {'$unset': {'profile_photo': ''}})
    return jsonify({'success': True})

@app.route('/profile_photo/<username>')
def serve_profile_photo(username):
    user = users_col.find_one({'username': username})
    if not user or 'profile_photo' not in user:
        return jsonify({'success': False, 'message': 'No profile photo'}), 404
    filename = user['profile_photo']
    return send_from_directory(PROFILE_PHOTO_DIR, filename)
