"""
Student Routes — /api/student
==============================
All routes require a valid student JWT (@student_required).
Handles a student's own profile management.
"""
from flask import Blueprint, request, current_app
from flask_jwt_extended import get_jwt_identity
from bson import ObjectId

from ..models.student_model import find_profile_by_user_id, update_profile, create_profile
from ..models.user_model import find_user_by_id
from ..utils.helpers import make_error, make_success, serialize_doc
from ..utils.decorators import student_required

student_bp = Blueprint("student", __name__)


# ── GET /api/student/profile ──────────────────────────────────────────────────
@student_bp.route("/profile", methods=["GET"])
@student_required
def get_profile():
    """Returns the authenticated student's profile merged with user info."""
    try:
        user_id = get_jwt_identity()
        user = find_user_by_id(user_id)
        if not user:
            return make_error("User not found", 404)

        profile = find_profile_by_user_id(user_id) or {}

        data = {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "prn": profile.get("prn", ""),
            "branch": profile.get("branch", ""),
            "year": profile.get("year", 1),
            "cgpa": profile.get("cgpa", 0.0),
            "skills": profile.get("skills", []),
            "resumeUrl": profile.get("resumeUrl", ""),
            "status": profile.get("status", "Unplaced"),
        }

        return make_success(data=serialize_doc(data), status_code=200)

    except Exception as e:
        current_app.logger.error(f"Get profile error: {e}")
        return make_error("Failed to fetch profile", 500)


# ── PUT /api/student/profile ──────────────────────────────────────────────────
@student_bp.route("/profile", methods=["PUT"])
@student_required
def update_student_profile():
    """
    Update the authenticated student's own profile.
    Body: { "prn": str, "branch": str, "year": int, "cgpa": float,
            "skills": [str], "resumeUrl": str }
    Students cannot change their own placement status (admin-only field).
    """
    try:
        user_id = get_jwt_identity()

        data = request.get_json(silent=True)
        if not data:
            return make_error("Request body must be JSON", 400)

        # Students cannot self-update placement status
        data.pop("status", None)

        # Update name in users collection if provided
        if "name" in data:
            current_app.db["users"].update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"name": data.pop("name")}}
            )

        # Ensure profile exists before updating
        existing = find_profile_by_user_id(user_id)
        if not existing:
            create_profile(user_id)

        if data:
            update_profile(user_id, data)

        return make_success(message="Profile updated successfully", status_code=200)

    except Exception as e:
        current_app.logger.error(f"Update profile error: {e}")
        return make_error("Failed to update profile", 500)
