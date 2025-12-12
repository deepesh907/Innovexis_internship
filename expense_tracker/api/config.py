import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration"""
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-this-in-production")
    # Optional email / frontend settings (used for verification emails)
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
    SMTP_HOST = os.getenv("SMTP_HOST")
    SMTP_PORT = os.getenv("SMTP_PORT")
    SMTP_USER = os.getenv("SMTP_USER")
    SMTP_PASS = os.getenv("SMTP_PASS")
    EMAIL_FROM = os.getenv("EMAIL_FROM")

class DevelopmentConfig(Config):
    """Development configuration - PostgreSQL recommended, SQLite fallback"""
    # If DATABASE_URL not set, try PostgreSQL first; fallback to SQLite if Postgres unavailable
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "postgresql://tracker_user:tracker_password@localhost:5432/expense_tracker"
    )
    DEBUG = True
    TESTING = False

class PostgresConfig(Config):
    """PostgreSQL configuration - Production ready"""
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "postgresql://tracker_user:tracker_password@localhost:5432/expense_tracker"
    )
    DEBUG = False
    TESTING = False

class TestingConfig(Config):
    """Testing configuration"""
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    DEBUG = True
    TESTING = True

# Select config based on environment
config = {
    'development': DevelopmentConfig,
    'postgres': PostgresConfig,
    'testing': TestingConfig,
    'default': PostgresConfig  # Changed to PostgreSQL by default
}

# Get active config
FLASK_ENV = os.getenv('FLASK_ENV', 'development')
Config = config.get(FLASK_ENV, PostgresConfig)  # Changed to PostgreSQL by default
