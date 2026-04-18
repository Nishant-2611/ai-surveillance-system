from flask import Blueprint, request, jsonify, send_file, current_app
from flask_jwt_extended import jwt_required
from models import Alert
from extensions import db
from gsm_simulator import send_gsm_alert
from datetime import datetime
import os
import uuid

surveillance_bp = Blueprint('surveillance', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp4', 'avi', 'mov', 'webm'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@surveillance_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload():
    """Receives media + metadata from Raspberry Pi (or simulator)."""
    alert_type = request.form.get('type', 'motion')
    timestamp_str = request.form.get('timestamp')

    try:
        timestamp = datetime.fromisoformat(timestamp_str) if timestamp_str else datetime.utcnow()
    except ValueError:
        timestamp = datetime.utcnow()

    media_path = None
    media_filename = None

    if 'file' in request.files:
        file = request.files['file']
        if file and file.filename and allowed_file(file.filename):
            ext = file.filename.rsplit('.', 1)[1].lower()
            unique_name = f"{uuid.uuid4().hex}.{ext}"
            upload_folder = current_app.config['UPLOAD_FOLDER']
            os.makedirs(upload_folder, exist_ok=True)
            file.save(os.path.join(upload_folder, unique_name))
            media_filename = unique_name
            media_path = f"/static/uploads/{unique_name}"

    alert = Alert(timestamp=timestamp, type=alert_type,
                  media_path=media_path, media_filename=media_filename, status='unseen')
    db.session.add(alert)
    db.session.commit()

    # Trigger GSM simulation
    send_gsm_alert(alert_type, timestamp.isoformat(), alert.id)

    return jsonify({'message': 'Alert created', 'alert': alert.to_dict()}), 201


@surveillance_bp.route('/alerts', methods=['GET'])
@jwt_required()
def get_alerts():
    status_filter = request.args.get('status')
    query = Alert.query.order_by(Alert.timestamp.desc())
    if status_filter:
        query = query.filter_by(status=status_filter)
    alerts = query.all()
    return jsonify({'alerts': [a.to_dict() for a in alerts], 'total': len(alerts)}), 200


@surveillance_bp.route('/alerts/<int:alert_id>/seen', methods=['PATCH'])
@jwt_required()
def mark_seen(alert_id):
    alert = Alert.query.get_or_404(alert_id)
    alert.status = 'seen'
    db.session.commit()
    return jsonify({'message': 'Alert marked as seen', 'alert': alert.to_dict()}), 200


@surveillance_bp.route('/recordings', methods=['GET'])
@jwt_required()
def get_recordings():
    recordings = Alert.query.filter(
        Alert.media_path.isnot(None)
    ).order_by(Alert.timestamp.desc()).all()
    return jsonify({'recordings': [r.to_dict() for r in recordings], 'total': len(recordings)}), 200


@surveillance_bp.route('/recording/<int:recording_id>', methods=['GET'])
@jwt_required()
def get_recording(recording_id):
    alert = Alert.query.get_or_404(recording_id)
    if not alert.media_filename:
        return jsonify({'error': 'No media file associated with this alert'}), 404

    file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], alert.media_filename)
    if not os.path.exists(file_path):
        return jsonify({'error': 'File not found on server'}), 404

    return send_file(file_path, as_attachment=False)
