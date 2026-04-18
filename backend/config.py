import os
from datetime import timedelta
from dotenv import load_dotenv
from urllib.parse import quote_plus

# Load environment variables from .env
load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'surveillance-secret-key-2024')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-surveillance-secret-2024')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)

    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    
    # MySQL Configuration
    DB_USER = os.environ.get('DB_USER', 'root')
    DB_PASSWORD = os.environ.get('DB_PASSWORD', '')
    DB_HOST = os.environ.get('DB_HOST', 'localhost')
    DB_NAME = os.environ.get('DB_NAME', 'surveillance_db')
    
    # URL-encode the password to handle special characters like '@'
    SAFE_PASSWORD = quote_plus(DB_PASSWORD) if DB_PASSWORD else ''
    
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        f'mysql+pymysql://{DB_USER}:{SAFE_PASSWORD}@{DB_HOST}/{DB_NAME}'
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'static', 'uploads')
    MAX_CONTENT_LENGTH = 100 * 1024 * 1024  # 100 MB
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp4', 'avi', 'mov', 'webm'}
