"""
Flask App Factory
=================
Creates and configures the Flask application instance.
All extensions are initialized here and blueprints are registered.
"""
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from pymongo import MongoClient
from dotenv import load_dotenv

# Load .env before anything else
load_dotenv()

from .config import Config

# Extension instances (imported by routes/models to avoid circular imports)
bcrypt = Bcrypt()
jwt = JWTManager()


def create_app() -> Flask:
    """Application factory — call this to get a configured Flask app."""
    app = Flask(__name__)

    # ── Load Configuration ──────────────────────────────────────────────────
    app.config["MONGO_URI"] = Config.MONGO_URI
    app.config["JWT_SECRET_KEY"] = Config.JWT_SECRET_KEY
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = Config.JWT_ACCESS_TOKEN_EXPIRES
    app.config["DEBUG"] = Config.DEBUG

    # ── Initialize Extensions ───────────────────────────────────────────────
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    bcrypt.init_app(app)
    jwt.init_app(app)

    # ── MongoDB Connection ──────────────────────────────────────────────────
    mongo_client = MongoClient(Config.MONGO_URI)
    app.db = mongo_client[Config.DB_NAME]

    # ── Register Blueprints ─────────────────────────────────────────────────
    from .routes.auth_routes import auth_bp
    from .routes.admin_routes import admin_bp
    from .routes.student_routes import student_bp
    from .routes.job_routes import job_bp
    from .routes.event_routes import event_bp
    from .routes.application_routes import application_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(student_bp, url_prefix="/api/student")
    app.register_blueprint(job_bp, url_prefix="/api/jobs")
    app.register_blueprint(event_bp, url_prefix="/api/events")
    app.register_blueprint(application_bp, url_prefix="/api/applications")

    # ── Health Check ────────────────────────────────────────────────────────
    @app.route("/api/health", methods=["GET"])
    def health():
        return {"status": "ok", "message": "T&P Cell Portal API is running"}, 200

    return app
