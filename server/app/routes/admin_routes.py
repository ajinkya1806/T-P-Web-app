"""
Admin Routes — /api/admin
==========================
All routes require a valid admin JWT (@admin_required).
Handles dashboard stats and student management.
"""
from flask import Blueprint, request, current_app
from bson import ObjectId

from ..models.user_model import (
    find_user_by_id,
    get_all_users_by_role,
    find_user_by_email,
    create_user,
)
from ..models.student_model import (
    get_all_profiles,
    find_profile_by_user_id,
    update_profile,
    delete_profile,
    create_profile,
)
from ..utils.helpers import make_error, make_success, serialize_doc, serialize_list
from ..utils.decorators import admin_required

admin_bp = Blueprint("admin", __name__)


# ── GET /api/admin/stats ──────────────────────────────────────────────────────
@admin_bp.route("/stats", methods=["GET"])
@admin_required
def get_stats():
    """Dashboard statistics: total students, placed, unplaced, active jobs."""
    try:
        db = current_app.db
        total_students = db["users"].count_documents({"role": "student"})
        placed = db["studentProfiles"].count_documents({"status": "Placed"})
        unplaced = db["studentProfiles"].count_documents({"status": "Unplaced"})
        active_jobs = db["jobs"].count_documents({"status": "Active"})
        total_events = db["events"].count_documents({})
        total_applications = db["applications"].count_documents({})

        return make_success(
            data={
                "totalStudents": total_students,
                "placedStudents": placed,
                "unplacedStudents": unplaced,
                "activeJobs": active_jobs,
                "totalEvents": total_events,
                "totalApplications": total_applications,
            },
            status_code=200,
        )
    except Exception as e:
        current_app.logger.error(f"Stats error: {e}")
        return make_error("Failed to fetch statistics", 500)


# ── GET /api/admin/students ───────────────────────────────────────────────────
@admin_bp.route("/students", methods=["GET"])
@admin_required
def list_students():
    """
    Returns all students with their profile data merged.
    Supports optional query params: ?branch=CS&status=Placed
    """
    try:
        branch_filter = request.args.get("branch")
        status_filter = request.args.get("status")

        users = get_all_users_by_role("student")
        profiles = {str(p["userId"]): p for p in get_all_profiles()}

        result = []
        for user in users:
            uid = str(user["_id"])
            profile = profiles.get(uid, {})

            # Apply filters
            if branch_filter and profile.get("branch", "").upper() != branch_filter.upper():
                continue
            if status_filter and profile.get("status", "") != status_filter:
                continue

            merged = {
                "id": uid,
                "name": user["name"],
                "email": user["email"],
                "createdAt": user.get("createdAt"),
                "prn": profile.get("prn", ""),
                "branch": profile.get("branch", ""),
                "year": profile.get("year", 1),
                "cgpa": profile.get("cgpa", 0.0),
                "skills": profile.get("skills", []),
                "resumeUrl": profile.get("resumeUrl", ""),
                "status": profile.get("status", "Unplaced"),
            }
            result.append(serialize_doc(merged))

        return make_success(data=result, status_code=200)

    except Exception as e:
        current_app.logger.error(f"List students error: {e}")
        return make_error("Failed to fetch students", 500)


# ── GET /api/admin/students/<id> ──────────────────────────────────────────────
@admin_bp.route("/students/<string:student_id>", methods=["GET"])
@admin_required
def get_student(student_id):
    """Get a single student by user ID, with profile merged."""
    try:
        user = find_user_by_id(student_id)
        if not user or user.get("role") != "student":
            return make_error("Student not found", 404)

        profile = find_profile_by_user_id(student_id) or {}

        data = {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "createdAt": user.get("createdAt"),
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
        current_app.logger.error(f"Get student error: {e}")
        return make_error("Failed to fetch student", 500)


# ── PUT /api/admin/students/<id> ──────────────────────────────────────────────
@admin_bp.route("/students/<string:student_id>", methods=["PUT"])
@admin_required
def update_student(student_id):
    """
    Update a student's profile fields.
    Body: { "branch": str, "cgpa": float, "status": str, ... }
    """
    try:
        user = find_user_by_id(student_id)
        if not user or user.get("role") != "student":
            return make_error("Student not found", 404)

        data = request.get_json(silent=True)
        if not data:
            return make_error("Request body must be JSON", 400)

        # Update name in users collection if provided
        if "name" in data:
            current_app.db["users"].update_one(
                {"_id": ObjectId(student_id)},
                {"$set": {"name": data["name"]}}
            )

        # Update profile fields
        profile_updates = {k: v for k, v in data.items() if k != "name"}
        if profile_updates:
            updated = update_profile(student_id, profile_updates)
            if not updated:
                # Profile might not exist yet — create it
                create_profile(student_id)
                update_profile(student_id, profile_updates)

        return make_success(message="Student updated successfully", status_code=200)

    except Exception as e:
        current_app.logger.error(f"Update student error: {e}")
        return make_error("Failed to update student", 500)


# ── DELETE /api/admin/students/<id> ──────────────────────────────────────────
@admin_bp.route("/students/<string:student_id>", methods=["DELETE"])
@admin_required
def delete_student(student_id):
    """Remove a student account and their profile."""
    try:
        user = find_user_by_id(student_id)
        if not user or user.get("role") != "student":
            return make_error("Student not found", 404)

        # Delete user + profile
        current_app.db["users"].delete_one({"_id": ObjectId(student_id)})
        delete_profile(student_id)

        return make_success(message="Student deleted successfully", status_code=200)

    except Exception as e:
        current_app.logger.error(f"Delete student error: {e}")
        return make_error("Failed to delete student", 500)
