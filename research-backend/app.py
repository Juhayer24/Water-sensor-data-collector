from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient

app = Flask(__name__)
CORS(app)

# Replace with your MongoDB URI if using Atlas
client = MongoClient("mongodb://localhost:27017")
db = client["mydb"]
systems_col = db["systems"]
users_col = db["users"]

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
    return jsonify({'success': True, 'message': 'User created'}), 200

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

if __name__ == '__main__':
    app.run(debug=True)
