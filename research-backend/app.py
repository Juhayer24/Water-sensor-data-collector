from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from pymongo import MongoClient
from flask_mail import Mail, Message
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
import os
import random
import string
from datetime import datetime, timedelta

load_dotenv()

app = Flask(__name__)
CORS(app)

# MongoDB setup
client = MongoClient("mongodb://localhost:27017")
db = client["mydb"]
systems_col = db["systems"]
users_col = db["users"]
reset_codes_col = db["reset_codes"]  # New collection for reset codes

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

def generate_reset_code():
    """Generate a 6-digit random code"""
    return ''.join(random.choices(string.digits, k=6))

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

@app.route('/forgot_password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')
    
    if not email:
        return jsonify({'success': False, 'message': 'Email is required'}), 400
    
    # Check if user exists
    user = users_col.find_one({'email': email})
    if not user:
        return jsonify({'success': False, 'message': 'Email not found'}), 404
    
    # Generate reset code
    reset_code = generate_reset_code()
    
    # Store reset code in database with expiration (15 minutes)
    expiry_time = datetime.now() + timedelta(minutes=15)
    reset_codes_col.insert_one({
        'email': email,
        'code': reset_code,
        'expires_at': expiry_time,
        'used': False
    })
    
    # Send email with reset code
    try:
        msg = Message(
            subject="Password Reset Code - SensorData System",
            sender=app.config['MAIL_USERNAME'],
            recipients=[email]
        )
        msg.body = f"""Hi {user['username']},

You have requested to reset your password. Your reset code is: {reset_code}

This code will expire in 15 minutes. If you did not request this reset, please ignore this email.

Best regards,
SensorData System Team"""
        mail.send(msg)
        return jsonify({'success': True, 'message': 'Reset code sent to your email'})
    except Exception as e:
        print(f"Email sending failed: {e}")
        return jsonify({'success': False, 'message': 'Failed to send reset code'}), 500

@app.route('/verify_reset_code', methods=['POST'])
def verify_reset_code():
    data = request.get_json()
    email = data.get('email')
    code = data.get('code')
    
    if not email or not code:
        return jsonify({'success': False, 'message': 'Email and code are required'}), 400
    
    # Find valid reset code
    reset_entry = reset_codes_col.find_one({
        'email': email,
        'code': code,
        'used': False,
        'expires_at': {'$gt': datetime.now()}
    })
    
    if not reset_entry:
        return jsonify({'success': False, 'message': 'Invalid or expired code'}), 400
    
    return jsonify({'success': True, 'message': 'Code verified successfully'})

@app.route('/reset_password', methods=['POST'])
def reset_password():
    data = request.get_json()
    email = data.get('email')
    code = data.get('code')
    new_password = data.get('new_password')
    
    if not email or not code or not new_password:
        return jsonify({'success': False, 'message': 'All fields are required'}), 400
    
    # Find valid reset code
    reset_entry = reset_codes_col.find_one({
        'email': email,
        'code': code,
        'used': False,
        'expires_at': {'$gt': datetime.now()}
    })
    
    if not reset_entry:
        return jsonify({'success': False, 'message': 'Invalid or expired code'}), 400
    
    # Update user password
    result = users_col.update_one(
        {'email': email},
        {'$set': {'password': new_password}}
    )
    
    if result.modified_count == 0:
        return jsonify({'success': False, 'message': 'Failed to update password'}), 500
    
    # Mark reset code as used
    reset_codes_col.update_one(
        {'_id': reset_entry['_id']},
        {'$set': {'used': True}}
    )
    
    return jsonify({'success': True, 'message': 'Password reset successfully'})

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