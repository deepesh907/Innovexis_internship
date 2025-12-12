from flask import Flask
from flask_cors import CORS
from extensions import db
import os

def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///speech.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["UPLOAD_FOLDER"] = "uploads"

    CORS(app)
    db.init_app(app)

    # Blueprints
    from auth import auth_bp
    from convert import convert_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(convert_bp, url_prefix="/api/convert")

    # Create DB
    with app.app_context():
        db.create_all()
        print("🔥 Database initialized successfully!")

    # Home route
    @app.route("/")
    def home():
        return "🔥 Backend running successfully! API available at /api/"

    return app


app = create_app()

if __name__ == "__main__":
    print("🚀 Starting backend server at http://localhost:5000")
    app.run(host="127.0.0.1", port=5000, debug=True)
