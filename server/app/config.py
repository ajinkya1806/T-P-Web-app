import os
from datetime import timedelta


class Config:
    """
    All configuration loaded from environment variables.
    Never hardcode secrets — use the .env file.
    """

    # MongoDB
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
    DB_NAME: str = os.getenv("DB_NAME", "tnp_db")

    # JWT
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "change-me-in-production")
    JWT_ACCESS_TOKEN_EXPIRES: timedelta = timedelta(
        seconds=int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", "86400"))
    )

    # Flask
    DEBUG: bool = os.getenv("FLASK_DEBUG", "0") == "1"
