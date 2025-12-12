from flask import Blueprint, request, jsonify, current_app
from sqlalchemy.exc import IntegrityError
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from email.message import EmailMessage
import smtplib
from models import db, bcrypt, User
import re

auth = Blueprint('auth', __name__)

@auth.route("/api/register", methods=["POST"])
def register():
    data = request.json
    # Basic validation
    if not data or not data.get("username") or not data.get("password"):
        return jsonify({"error": "Username and password are required"}), 400

    # Normalize inputs
    username_raw = data.get("username")
    username = username_raw.strip() if username_raw else None
    email = data.get("email") if data.get("email") else None

    # Additional validation
    if not username or len(username) < 3:
        return jsonify({"error": "Username is required and must be at least 3 characters"}), 400
    password = data.get("password")
    if not password or len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    if email:
        # basic email format check
        if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
            return jsonify({"error": "Invalid email format"}), 400

    # Check if user already exists by username first; only check email if provided
    existing = None
    if username:
        existing = User.query.filter(User.username == username).first()
    if not existing and email:
        existing = User.query.filter(User.email == email).first()
    if existing:
        return jsonify({"error": "User already exists"}), 409

    hashed = bcrypt.generate_password_hash(password).decode("utf-8")
    user = User(username=username, email=email, password_hash=hashed)
    try:
        db.session.add(user)
        db.session.commit()

        # If an email was provided, generate a verification token and include a demo link
        verification_link = None
        if email:
            secret = current_app.config.get("SECRET_KEY") or "dev-secret"
            serializer = URLSafeTimedSerializer(secret)
            token = serializer.dumps(email, salt="email-confirm")

            # Build both backend verify URL and a frontend verify URL (for user-facing links)
            backend_verify = f"/api/verify-email?token={token}"
            frontend_base = current_app.config.get("FRONTEND_URL") or "http://localhost:5173"
            frontend_verify = f"{frontend_base}/verify-email?token={token}"

            # Attempt to send email if SMTP config present; otherwise include demo link in response
            smtp_host = current_app.config.get("SMTP_HOST")
            if smtp_host:
                try:
                    msg = EmailMessage()
                    msg["Subject"] = "Verify your ExpenseTracker email"
                    msg["From"] = current_app.config.get("EMAIL_FROM") or "no-reply@example.com"
                    msg["To"] = email
                    msg.set_content(f"Hi {username},\n\nPlease verify your email by visiting the following link:\n{frontend_verify}\n\nIf you didn't request this, ignore this message.")

                    port = int(current_app.config.get("SMTP_PORT") or 587)
                    smtp_user = current_app.config.get("SMTP_USER")
                    smtp_pass = current_app.config.get("SMTP_PASS")

                    if port == 465:
                        server = smtplib.SMTP_SSL(smtp_host, port)
                    else:
                        server = smtplib.SMTP(smtp_host, port)
                        server.starttls()

                    if smtp_user and smtp_pass:
                        server.login(smtp_user, smtp_pass)

                    server.send_message(msg)
                    server.quit()
                    # Indicate that we sent an email (don't include token in response in prod)
                    verification_link = frontend_verify
                except Exception as send_err:
                    # If sending fails, fall back to returning the demo link so testing can continue
                    current_app.logger.warning(f"Failed to send verification email: {send_err}")
                    verification_link = frontend_verify
            else:
                # No SMTP configured — return the demo frontend verify link for testing
                verification_link = frontend_verify

        payload = {"message": "User registered", "user_id": user.id}
        if verification_link:
            payload["verification_link"] = verification_link

        return jsonify(payload), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "User already exists"}), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Registration failed", "details": str(e)}), 500


@auth.route("/api/verify-email", methods=["GET"])
def verify_email():
    token = request.args.get("token")
    if not token:
        return jsonify({"error": "Token is required"}), 400

    secret = current_app.config.get("SECRET_KEY") or "dev-secret"
    serializer = URLSafeTimedSerializer(secret)
    try:
        email = serializer.loads(token, salt="email-confirm", max_age=60 * 60 * 24)
    except SignatureExpired:
        return jsonify({"error": "Token expired"}), 400
    except BadSignature:
        return jsonify({"error": "Invalid token"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    user.is_verified = True
    try:
        db.session.add(user)
        db.session.commit()
        return jsonify({"message": "Email verified", "user_id": user.id})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Verification failed", "details": str(e)}), 500

@auth.route("/api/login", methods=["POST"])
def login():
    data = request.json
    user = User.query.filter_by(username=data["username"]).first()
    if user and bcrypt.check_password_hash(user.password_hash, data["password"]):
        return jsonify({"message": "Login successful", "user_id": user.id})
    return jsonify({"error": "Invalid credentials"}), 401
