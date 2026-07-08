"""
Student Profile Model — Data access helpers for the 'studentProfiles' collection.

Schema:
{
    "_id":        ObjectId,
    "userId":     ObjectId  (ref → users._id),
    "prn":        str,
    "branch":     str,
    "year":       int,
    "cgpa":       float,
    "skills":     [str],
    "resumeUrl":  str,
    "status":     "Placed" | "Unplaced"
}
"""
from bson import ObjectId
from flask import current_app


def get_profiles_col():
    return current_app.db["studentProfiles"]


def find_profile_by_user_id(user_id: str) -> dict | None:
    try:
        return get_profiles_col().find_one({"userId": ObjectId(user_id)})
    except Exception:
        return None


def create_profile(user_id: str, prn: str = "", branch: str = "",
                   year: int = 1, cgpa: float = 0.0,
                   skills: list = None, resume_url: str = "") -> str:
    """Create an empty student profile linked to a user. Returns inserted _id."""
    doc = {
        "userId": ObjectId(user_id),
        "prn": prn,
        "branch": branch,
        "year": year,
        "cgpa": cgpa,
        "skills": skills or [],
        "resumeUrl": resume_url,
        "status": "Unplaced",
    }
    result = get_profiles_col().insert_one(doc)
    return str(result.inserted_id)


def update_profile(user_id: str, updates: dict) -> bool:
    """Update a student profile by userId. Returns True if a document was modified."""
    allowed_fields = {"prn", "branch", "year", "cgpa", "skills", "resumeUrl", "status"}
    clean = {k: v for k, v in updates.items() if k in allowed_fields}
    if not clean:
        return False
    result = get_profiles_col().update_one(
        {"userId": ObjectId(user_id)},
        {"$set": clean}
    )
    return result.modified_count > 0


def get_all_profiles() -> list:
    return list(get_profiles_col().find())


def delete_profile(user_id: str) -> bool:
    result = get_profiles_col().delete_one({"userId": ObjectId(user_id)})
    return result.deleted_count > 0
