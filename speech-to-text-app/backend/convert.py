from flask import Blueprint, request, jsonify
from extensions import db
import os
import requests
from werkzeug.utils import secure_filename
from pydub import AudioSegment

convert_bp = Blueprint("convert", __name__)

UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"mp3", "wav", "m4a", "ogg"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@convert_bp.route("/", methods=["POST"])
def convert_audio():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        audio = request.files["file"]

        if audio.filename == "":
            return jsonify({"error": "No file selected"}), 400

        if not allowed_file(audio.filename):
            return jsonify({"error": "Invalid file type"}), 400

        filename = secure_filename(audio.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        audio.save(filepath)

        # ---- DeepInfra API call ----
        API_KEY = os.getenv("DEEPINFRA_API_KEY")
        url = "https://api.deepinfra.com/v1/inference/openai/whisper-large-v3"

        with open(filepath, "rb") as f:
            response = requests.post(
                url,
                headers={"Authorization": f"Bearer {API_KEY}"},
                files={"file": f},
            )

        if response.status_code != 200:
            return jsonify({"error": "DeepInfra failed", "details": response.text}), 500

        transcript = response.json().get("text", "")

        return jsonify({"text": transcript})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
