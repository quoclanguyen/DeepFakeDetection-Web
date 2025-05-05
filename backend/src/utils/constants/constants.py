import os
from dotenv import load_dotenv

load_dotenv(dotenv_path = ".env")
QDRANT_API_KEY = os.environ.get("QDRANT_API_KEY")
QDRANT_ENDPOINT = os.environ.get("QDRANT_ENDPOINT")
PORT = os.environ.get("PORT")
MONGODB_CONNECTION_STRING = os.environ.get("MONGODB_CONNECTION_STRING")
SMTP_EMAIL = os.environ.get("SMTP_EMAIL")
SMTP_PASS = os.environ.get("SMTP_PASS")
SMTP_SERVER = os.environ.get("SMTP_SERVER")
SMTP_PORT = os.environ.get("SMTP_PORT")
SECRET_KEY = os.environ.get("SECRET_KEY")
ROOT_WEIGHT_PATH = os.environ.get("ROOT_WEIGHT_PATH")
IMAGE_SIZE = 256