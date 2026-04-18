from flask import Flask, render_template
from flask_cors import CORS
from config import Config
from extensions import db, jwt
import os


def create_app():
    app = Flask(__name__, template_folder='templates', static_folder='static')
    app.config.from_object(Config)

    # Extensions
    db.init_app(app)
    jwt.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Ensure upload dir exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Blueprints
    from routes.auth import auth_bp
    from routes.surveillance import surveillance_bp
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(surveillance_bp, url_prefix='/api')

    # Frontend routes
    @app.route('/')
    @app.route('/login')
    def login_page():
        return render_template('login.html')

    @app.route('/dashboard')
    def dashboard_page():
        return render_template('dashboard.html')

    # Create tables
    with app.app_context():
        db.create_all()

    return app


if __name__ == '__main__':
    application = create_app()
    application.run(debug=True, host='0.0.0.0', port=5000)
