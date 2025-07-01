from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow requests from your frontend

systems = []  # In-memory list for demo; use a database for production
users = []  # In-memory user store: list of dicts with keys: username, password, email

@app.route('/add_system', methods=['POST'])
def add_system():
    data = request.get_json()
    system_name = data.get('system_name')
    if not system_name or system_name in systems:
        return jsonify({'error': 'Invalid or duplicate system name'}), 400
    systems.append(system_name)
    return jsonify({'message': 'System added'}), 200

@app.route('/get_systems', methods=['GET'])
def get_systems():
    return jsonify({'systems': systems})

@app.route('/stop', methods=['GET'])
def stop():
    # Dummy endpoint for your frontend
    return 'Stopped', 200

@app.route('/start', methods=['POST'])
def start():
    # Dummy endpoint for your frontend
    return 'Started', 200

@app.route('/delete_all_systems', methods=['POST'])
def delete_all_systems():
    global systems
    systems = []
    return jsonify({'message': 'All systems deleted'}), 200

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')
    if not username or not password or not email:
        return jsonify({'success': False, 'message': 'All fields are required.'}), 400
    if any(u['username'] == username for u in users):
        return jsonify({'success': False, 'message': 'Username already exists.'}), 400
    users.append({'username': username, 'password': password, 'email': email})
    return jsonify({'success': True, 'message': 'User created.'}), 200

@app.route('/authenticate', methods=['POST'])
def authenticate():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    user = next((u for u in users if u['username'] == username and u['password'] == password), None)
    if user:
        return jsonify({'success': True, 'redirect': 'home.html'})
    else:
        return jsonify({'success': False, 'message': 'Invalid username or password.'}), 401

@app.route('/profile')
def profile():
    username = request.args.get('username')
    user = next((u for u in users if u['username'] == username), None)
    if user:
        return jsonify({'success': True, 'user': {'username': user['username'], 'email': user['email']}})
    else:
        return jsonify({'success': False, 'message': 'User not found.'}), 404

if __name__ == '__main__':
    app.run(debug=True)