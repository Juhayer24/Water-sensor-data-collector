from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow requests from your frontend

systems = []  # In-memory list for demo; use a database for production

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

if __name__ == '__main__':
    app.run(debug=True)