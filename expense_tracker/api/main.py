from flask import Flask
from flask_cors import CORS
from config import Config
from models import db, bcrypt
from routes.auth import auth
from routes.expenses import expenses

app = Flask(__name__)
app.config.from_object(Config)

CORS(app)

db.init_app(app)
bcrypt.init_app(app)

app.register_blueprint(auth)
app.register_blueprint(expenses)

# Note: Schema is managed by Alembic migrations, not db.create_all()
# Run 'alembic upgrade head' to apply migrations after starting a new database
    
@app.route("/")
def home():
    return "Expense Tracker API is running"

if __name__ == "__main__":
    app.run(debug=True)
