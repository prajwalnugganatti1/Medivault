"""
MediVault - Python Flask Runner
Serves the web application and provides REST API routes for
Authentication, OTP verification, Doctor Special Keys, and MediBot AI.
"""

from flask import Flask, send_from_directory, jsonify, request
import os
import random
import time

app = Flask(__name__, static_folder='.')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# In-memory OTP & Key storage
otp_cache = {}
doctor_keys = [
    {"id": "DKEY-1", "keyCode": "DOC-KEY-8472", "doctorName": "Dr. Rahul Sharma", "hospital": "Apollo Specialty Hospital", "status": "active"},
    {"id": "DKEY-2", "keyCode": "DOC-KEY-5219", "doctorName": "Dr. Priya Kumar", "hospital": "Fortis Memorial Healthcare", "status": "active"},
    {"id": "DKEY-3", "keyCode": "DOC-KEY-9941", "doctorName": "New Doctor Authorization", "hospital": "AIIMS / City Medical Center", "status": "active"}
]

@app.route('/')
def index():
    return send_from_directory(BASE_DIR, 'index.html')

@app.route('/<path:path>')
def static_files(path):
    if os.path.exists(os.path.join(BASE_DIR, path)):
        return send_from_directory(BASE_DIR, path)
    return send_from_directory(BASE_DIR, 'index.html')

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "app": "MediVault",
        "version": "2.0.0"
    })

@app.route('/api/auth/patient/request-otp', methods=['POST'])
def patient_request_otp():
    data = request.get_json(silent=True) or {}
    contact = data.get('phone') or data.get('email') or 'patient'
    otp = str(random.randint(100000, 999999))
    otp_cache[contact] = {"otp": otp, "expires": time.time() + 300}
    return jsonify({
        "success": True,
        "message": f"OTP sent to {contact}",
        "otp": otp
    })

@app.route('/api/auth/doctor/verify-key', methods=['POST'])
def doctor_verify_key():
    data = request.get_json(silent=True) or {}
    key_code = (data.get('keyCode') or '').strip().upper()
    match = next((k for k in doctor_keys if k['keyCode'] == key_code and k['status'] == 'active'), None)
    if match:
        return jsonify({
            "success": True,
            "key": match,
            "message": "Doctor Key validated successfully."
        })
    return jsonify({
        "success": False,
        "reason": "Invalid or revoked Doctor Access Key. Contact Administrator."
    }), 401

@app.route('/api/admin/keys/generate', methods=['POST'])
def admin_generate_key():
    data = request.get_json(silent=True) or {}
    new_key = {
        "id": f"DKEY-{len(doctor_keys) + 1}",
        "keyCode": f"DOC-KEY-{random.randint(1000, 9999)}",
        "doctorName": data.get('doctorName', 'Authorized Physician'),
        "hospital": data.get('hospital', 'Hospital'),
        "status": "active"
    }
    doctor_keys.insert(0, new_key)
    return jsonify({"success": True, "key": new_key})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print("=" * 60)
    print(f" MediVault Healthcare Platform v2.0 (Flask Runner)")
    print(f" Open in Browser: http://localhost:{port}")
    print("=" * 60)
    app.run(host='0.0.0.0', port=port, debug=True)
