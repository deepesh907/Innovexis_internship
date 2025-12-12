from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from models import User
from extensions import db
import jwt, datetime, os

auth_bp = Blueprint("auth", __name__)

SECRET = "SECRET123"   # replace with env

def create_token(user):
    return jwt.encode(
        {
            "id": user.id,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)
        },
        SECRET,
        algorithm="HS256"
    )


@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.json
    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "User already exists"}), 400

    hashed = generate_password_hash(data["password"])
    user = User(username=data["username"], email=data["email"], password=hashed)
    
    db.session.add(user)
    db.session.commit()

    token = create_token(user)
    return jsonify({"message": "Created", "token": token}), 200


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    user = User.query.filter_by(email=data["email"]).first()
    if not user or not check_password_hash(user.password, data["password"]):
        return jsonify({"error": "Invalid credentials"}), 401

    token = create_token(user)
    return jsonify({"message": "Logged in", "token": token}), 200
