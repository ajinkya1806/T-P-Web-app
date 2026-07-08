"""
User Model — Data access helpers for the 'users' collection.

Schema:
{
    "_id":       ObjectId,
    "role":      "admin" | "student",
    "email":     str (unique),
    "password":  str (bcrypt hash),
    "name":      str,
    "createdAt": datetime
}
"""
from datetime import datetime, timezone
from bson import ObjectId
from flask import current_app


def get_users_col():
    return current_app.db["users"]


def find_user_by_email(email: str) -> dict | None:
    return get_users_col().find_one({"email": email.lower().strip()})


def find_user_by_id(user_id: str) -> dict | None:
    try:
        return get_users_col().find_one({"_id": ObjectId(user_id)})
    except Exception:
        return None


def create_user(name: str, email: str, hashed_password: str, role: str) -> str:
    """Insert a new user and return the inserted _id as a string."""
    doc = {
        "name": name,
        "email": email.lower().strip(),
        "password": hashed_password,
        "role": role,
        "createdAt": datetime.now(timezone.utc),
    }
    result = get_users_col().insert_one(doc)
    return str(result.inserted_id)


def count_admins() -> int:
    return get_users_col().count_documents({"role": "admin"})


def get_all_users_by_role(role: str) -> list:
    return list(get_users_col().find({"role": role}))
