from flask import Flask
from flask_cors import CORS
from .config import Config

def create_app():
    app = Flask(__name__)
    
    # Configure CORS
    CORS(app, resources={
        r"/*": {
            "origins": Config.CORS_ORIGIN,
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    # Import and register blueprints
    from .routes.meeting import meeting_bp
    app.register_blueprint(meeting_bp, url_prefix='/api')

    @app.route('/')
    def health_check():
        return {"status": "healthy", "message": "Utom Meet API is running"}

    return app 