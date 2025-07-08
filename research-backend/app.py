from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from pymongo import MongoClient
from flask_mail import Mail, Message
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

# MongoDB setup
client = MongoClient("mongodb://localhost:27017")
db = client["mydb"]
systems_col = db["systems"]
users_col = db["users"]

# Email configuration
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USERNAME'] = os.getenv('EMAIL_USER')
app.config['MAIL_PASSWORD'] = os.getenv('EMAIL_PASS')
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False

mail = Mail(app)

PROFILE_PHOTO_DIR = os.path.join(os.path.dirname(__file__), 'profile_photos')
os.makedirs(PROFILE_PHOTO_DIR, exist_ok=True)

@app.route('/add_system', methods=['POST'])
def add_system():
    data = request.get_json()
    system_name = data.get('system_name')
    username = data.get('username')
    if not system_name or not username:
        return jsonify({'success': False, 'message': 'System name and username required'}), 400
    if systems_col.find_one({'name': system_name, 'username': username}):
        return jsonify({'success': False, 'message': 'Duplicate system name'}), 400
    systems_col.insert_one({'name': system_name, 'username': username})
    return jsonify({'success': True, 'message': 'System added'}), 200

@app.route('/get_systems', methods=['GET'])
def get_systems():
    username = request.args.get('username')
    if not username:
        return jsonify({'systems': []})
    systems = [s['name'] for s in systems_col.find({'username': username})]
    return jsonify({'systems': systems})

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')
    if not username or not password or not email:
        return jsonify({'success': False, 'message': 'All fields required'}), 400
    if users_col.find_one({'username': username}):
        return jsonify({'success': False, 'message': 'Username exists'}), 400
    users_col.insert_one({'username': username, 'password': password, 'email': email})

    try:
        msg = Message(
            subject="Welcome to SensorData System",
            sender=app.config['MAIL_USERNAME'],
            recipients=[email]
        )
        msg.body = f"Hi {username},\n\nYour account has been successfully created. Thank you for signing up!"
        mail.send(msg)
    except Exception as e:
        print(f"Email sending failed: {e}")

    return jsonify({'success': True, 'message': 'User created and email sent'}), 200

@app.route('/authenticate', methods=['POST'])
def authenticate():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    user = users_col.find_one({'username': username, 'password': password})
    if user:
        return jsonify({'success': True, 'redirect': '/home', 'username': user['username'], 'email': user['email']})
    else:
        return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

@app.route('/profile')
def profile():
    username = request.args.get('username')
    user = users_col.find_one({'username': username})
    if user:
        return jsonify({'success': True, 'user': {'username': user['username'], 'email': user['email']}})
    else:
        return jsonify({'success': False, 'message': 'User not found'}), 404

@app.route('/delete_all_systems', methods=['POST'])
def delete_all_systems():
    data = request.get_json()
    username = data.get('username')
    if not username:
        return jsonify({'success': False, 'message': 'Username required'}), 400
    systems_col.delete_many({'username': username})
    return jsonify({'success': True, 'message': 'All systems deleted'})

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

if __name__ == '__main__':
    app.run(debug=True)
