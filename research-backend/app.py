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

# Load environment variables from .env file (for email credentials, etc.)
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS so frontend can communicate with backend from different origins

#  MongoDB Setup 
# Connect to local MongoDB instance and select database and collections
client = MongoClient("mongodb://localhost:27017")
db = client["mydb"]
systems_col = db["systems"]       # Collection for user systems (like cameras)
users_col = db["users"]           # Collection for user info (username, email, password)
reset_codes_col = db["reset_codes"]  # Collection to store password reset codes

#  Email Configuration
# Setup email server settings using environment variables for security
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USERNAME'] = os.getenv('EMAIL_USER')
app.config['MAIL_PASSWORD'] = os.getenv('EMAIL_PASS')
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False

mail = Mail(app)  # Initialize Flask-Mail extension

# Directory to store uploaded profile photos
PROFILE_PHOTO_DIR = os.path.join(os.path.dirname(__file__), 'profile_photos')
os.makedirs(PROFILE_PHOTO_DIR, exist_ok=True)  # Create folder if it doesn't exist

def generate_reset_code():
    """Generate a secure 6-digit numeric code for password resets."""
    return ''.join(random.choices(string.digits, k=6))


#Add a New System for a User
@app.route('/add_system', methods=['POST'])
def add_system():
    data = request.get_json()
    system_name = data.get('system_name')
    username = data.get('username')

    # Validate required inputs
    if not system_name or not username:
        return jsonify({'success': False, 'message': 'System name and username required'}), 400
    
    # Prevent duplicate system names for the same user
    if systems_col.find_one({'name': system_name, 'username': username}):
        return jsonify({'success': False, 'message': 'Duplicate system name'}), 400
    
    # Insert new system document in DB
    systems_col.insert_one({'name': system_name, 'username': username})
    return jsonify({'success': True, 'message': 'System added'}), 200


#Get All Systems for a Given User
@app.route('/get_systems', methods=['GET'])
def get_systems():
    username = request.args.get('username')
    if not username:
        return jsonify({'systems': []})  # Return empty list if no username provided
    
    # Query systems belonging to the user
    systems = [s['name'] for s in systems_col.find({'username': username})]
    return jsonify({'systems': systems})


#User Signup Endpoint
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')

    # Validate all fields are filled
    if not username or not password or not email:
        return jsonify({'success': False, 'message': 'All fields required'}), 400
    
    # Check if username is already taken
    if users_col.find_one({'username': username}):
        return jsonify({'success': False, 'message': 'Username exists'}), 400
    
    # Add new user to DB
    users_col.insert_one({'username': username, 'password': password, 'email': email})

    # Try to send welcome email (optional failure won't block signup)
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


#User Login Authentication
@app.route('/authenticate', methods=['POST'])
def authenticate():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    # Look up user with matching username and password
    user = users_col.find_one({'username': username, 'password': password})
    if user:
        # Return success along with some user info and redirect path
        return jsonify({'success': True, 'redirect': '/home', 'username': user['username'], 'email': user['email']})
    else:
        return jsonify({'success': False, 'message': 'Invalid credentials'}), 401


# Forgot Password: Send Reset Code to Email
@app.route('/forgot_password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')
    
    if not email:
        return jsonify({'success': False, 'message': 'Email is required'}), 400
    
    # Check if email exists in users collection
    user = users_col.find_one({'email': email})
    if not user:
        return jsonify({'success': False, 'message': 'Email not found'}), 404
    
    # Generate a new reset code and store it with expiry
    reset_code = generate_reset_code()
    expiry_time = datetime.now() + timedelta(minutes=15)
    reset_codes_col.insert_one({
        'email': email,
        'code': reset_code,
        'expires_at': expiry_time,
        'used': False
    })
    
    # Send reset code email
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


#Verify Reset Code
@app.route('/verify_reset_code', methods=['POST'])
def verify_reset_code():
    data = request.get_json()
    email = data.get('email')
    code = data.get('code')
    
    if not email or not code:
        return jsonify({'success': False, 'message': 'Email and code are required'}), 400
    
    # Find a valid reset code that matches email, code, not used, and not expired
    reset_entry = reset_codes_col.find_one({
        'email': email,
        'code': code,
        'used': False,
        'expires_at': {'$gt': datetime.now()}
    })
    
    if not reset_entry:
        return jsonify({'success': False, 'message': 'Invalid or expired code'}), 400
    
    return jsonify({'success': True, 'message': 'Code verified successfully'})


# Reset Password with Verified Code
@app.route('/reset_password', methods=['POST'])
def reset_password():
    data = request.get_json()
    email = data.get('email')
    code = data.get('code')
    new_password = data.get('new_password')
    
    if not email or not code or not new_password:
        return jsonify({'success': False, 'message': 'All fields are required'}), 400
    
    # Verify the reset code again to ensure it's valid
    reset_entry = reset_codes_col.find_one({
        'email': email,
        'code': code,
        'used': False,
        'expires_at': {'$gt': datetime.now()}
    })
    
    if not reset_entry:
        return jsonify({'success': False, 'message': 'Invalid or expired code'}), 400
    
    # Update the user's password in the users collection
    result = users_col.update_one(
        {'email': email},
        {'$set': {'password': new_password}}
    )
    
    if result.modified_count == 0:
        return jsonify({'success': False, 'message': 'Failed to update password'}), 500
    
    # Mark this reset code as used to prevent reuse
    reset_codes_col.update_one(
        {'_id': reset_entry['_id']},
        {'$set': {'used': True}}
    )
    
    return jsonify({'success': True, 'message': 'Password reset successfully'})


# Get User Profile Information
@app.route('/profile')
def profile():
    username = request.args.get('username')
    user = users_col.find_one({'username': username})
    if user:
        return jsonify({'success': True, 'user': {'username': user['username'], 'email': user['email']}})
    else:
        return jsonify({'success': False, 'message': 'User not found'}), 404


# Delete All Systems of a User
@app.route('/delete_all_systems', methods=['POST'])
def delete_all_systems():
    data = request.get_json()
    username = data.get('username')
    if not username:
        return jsonify({'success': False, 'message': 'Username required'}), 400
    
    # Remove all system documents linked to the username
    systems_col.delete_many({'username': username})
    return jsonify({'success': True, 'message': 'All systems deleted'})


# Upload Profile Photo
@app.route('/upload_profile_photo', methods=['POST'])
def upload_profile_photo():
    username = request.form.get('username')

    # Check for photo and username presence
    if 'photo' not in request.files or not username:
        return jsonify({'success': False, 'message': 'Photo and username required'}), 400
    
    file = request.files['photo']
    if file.filename == '':
        return jsonify({'success': False, 'message': 'No selected file'}), 400
    
    # Secure filename and save to profile photos directory
    filename = secure_filename(f"{username}_profile_{file.filename}")
    filepath = os.path.join(PROFILE_PHOTO_DIR, filename)
    file.save(filepath)

    # Update user's profile_photo field in DB with filename
    users_col.update_one({'username': username}, {'$set': {'profile_photo': filename}})
    return jsonify({'success': True, 'filename': filename})


# Remove Profile Photo
@app.route('/remove_profile_photo', methods=['POST'])
def remove_profile_photo():
    data = request.get_json()
    username = data.get('username')
    
    user = users_col.find_one({'username': username})
    if not user or 'profile_photo' not in user:
        return jsonify({'success': False, 'message': 'No profile photo to remove'}), 400
    
    filename = user['profile_photo']
    filepath = os.path.join(PROFILE_PHOTO_DIR, filename)
    
    # Delete the photo file if it exists
    if os.path.exists(filepath):
        os.remove(filepath)
    
    # Remove profile_photo field from user's DB document
    users_col.update_one({'username': username}, {'$unset': {'profile_photo': ''}})
    return jsonify({'success': True})


# Serve Profile Photo to Frontend
@app.route('/profile_photo/<username>')
def serve_profile_photo(username):
    user = users_col.find_one({'username': username})
    
    # Return 404 if user or photo not found
    if not user or 'profile_photo' not in user:
        return jsonify({'success': False, 'message': 'No profile photo'}), 404
    
    filename = user['profile_photo']
    # Send photo file from profile photos directory
    return send_from_directory(PROFILE_PHOTO_DIR, filename)


#Run the Flask App
if __name__ == '__main__':
    app.run(debug=True)
