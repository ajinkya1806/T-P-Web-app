"""
Application Routes — /api/applications
========================================
Students apply to jobs; admins review and update statuses.
"""
from flask import Blueprint, request, current_app
from flask_jwt_extended import get_jwt_identity
from bson import ObjectId

from ..models.application_model import (
    find_application,
    create_application,
    get_applications_by_student,
    get_applications_by_job,
    update_application_status,
)
from ..models.job_model import find_job_by_id
from ..models.student_model import find_profile_by_user_id
from ..models.user_model import find_user_by_id
from ..utils.helpers import make_error, make_success, serialize_doc, serialize_list
from ..utils.decorators import admin_required, student_required, jwt_required_any

application_bp = Blueprint("applications", __name__)

VALID_STATUSES = {"Applied", "Shortlisted", "Hired", "Rejected"}


# ── POST /api/applications/apply ──────────────────────────────────────────────
@application_bp.route("/apply", methods=["POST"])
@student_required
def apply_to_job():
    """
    Student applies to a job.
    Body: { "jobId": str }
    Backend checks:
      1. Job is Active
      2. Student hasn't already applied
      3. Student meets CGPA & branch eligibility
    """
    try:
        student_id = get_jwt_identity()
        data = request.get_json(silent=True)
        if not data:
            return make_error("Request body must be JSON", 400)

        job_id = data.get("jobId", "").strip()
        if not job_id:
            return make_error("jobId is required", 400)

        # 1. Verify job exists and is active
        job = find_job_by_id(job_id)
        if not job:
            return make_error("Job not found", 404)
        if job.get("status") != "Active":
            return make_error("This job posting is no longer accepting applications", 400)

        # 2. Duplicate check
        if find_application(job_id, student_id):
            return make_error("You have already applied to this job", 409)

        # 3. Eligibility check
        profile = find_profile_by_user_id(student_id)
        if not profile:
            return make_error("Please complete your profile before applying", 400)

        eligibility = job.get("eligibility", {})
        min_cgpa = float(eligibility.get("minCgpa", 0))
        allowed_branches = [b.upper() for b in eligibility.get("branches", [])]
        student_cgpa = float(profile.get("cgpa", 0))
        student_branch = profile.get("branch", "").upper()

        if student_cgpa < min_cgpa:
            return make_error(
                f"Your CGPA ({student_cgpa}) is below the minimum required ({min_cgpa})", 400
            )

        if allowed_branches and student_branch not in allowed_branches:
            return make_error(
                f"Your branch ({profile.get('branch')}) is not eligible for this job", 400
            )

        app_id = create_application(job_id=job_id, student_id=student_id)

        return make_success(
            data={"applicationId": app_id},
            message="Application submitted successfully",
            status_code=201,
        )

    except Exception as e:
        current_app.logger.error(f"Apply error: {e}")
        return make_error("Failed to submit application", 500)


# ── GET /api/applications/my ──────────────────────────────────────────────────
@application_bp.route("/my", methods=["GET"])
@student_required
def get_my_applications():
    """Returns all applications for the authenticated student, with job details merged."""
    try:
        student_id = get_jwt_identity()
        apps = get_applications_by_student(student_id)

        result = []
        for app in apps:
            job = find_job_by_id(str(app.get("jobId", "")))
            enriched = {
                "id":          str(app["_id"]),
                "status":      app.get("status"),
                "appliedAt":   app.get("appliedAt"),
                "job": {
                    "id":          str(job["_id"]) if job else None,
                    "title":       job.get("title", "N/A") if job else "N/A",
                    "companyName": job.get("companyName", "N/A") if job else "N/A",
                    "packageLPA":  job.get("packageLPA", 0) if job else 0,
                    "deadline":    job.get("deadline") if job else None,
                    "status":      job.get("status") if job else None,
                } if job else None,
            }
            result.append(serialize_doc(enriched))

        return make_success(data=result, status_code=200)

    except Exception as e:
        current_app.logger.error(f"Get my applications error: {e}")
        return make_error("Failed to fetch applications", 500)


# ── GET /api/applications/job/<job_id> ────────────────────────────────────────
@application_bp.route("/job/<string:job_id>", methods=["GET"])
@admin_required
def get_job_applications(job_id):
    """Admin: returns all applications for a specific job, with student details merged."""
    try:
        job = find_job_by_id(job_id)
        if not job:
            return make_error("Job not found", 404)

        apps = get_applications_by_job(job_id)
        result = []
        for app in apps:
            student_id = str(app.get("studentId", ""))
            user       = find_user_by_id(student_id) or {}
            profile    = find_profile_by_user_id(student_id) or {}
            enriched = {
                "id":      str(app["_id"]),
                "status":  app.get("status"),
                "appliedAt": app.get("appliedAt"),
                "student": {
                    "id":     student_id,
                    "name":   user.get("name", "N/A"),
                    "email":  user.get("email", "N/A"),
                    "branch": profile.get("branch", ""),
                    "cgpa":   profile.get("cgpa", 0),
                    "prn":    profile.get("prn", ""),
                    "resumeUrl": profile.get("resumeUrl", ""),
                },
            }
            result.append(serialize_doc(enriched))

        return make_success(
            data={"job": serialize_doc(job), "applications": result},
            status_code=200
        )

    except Exception as e:
        current_app.logger.error(f"Get job applications error: {e}")
        return make_error("Failed to fetch applications", 500)


# ── PATCH /api/applications/<id>/status ───────────────────────────────────────
@application_bp.route("/<string:app_id>/status", methods=["PATCH"])
@admin_required
def update_status(app_id):
    """Admin: update an application status (Shortlisted / Hired / Rejected)."""
    try:
        data = request.get_json(silent=True)
        if not data:
            return make_error("Request body must be JSON", 400)

        status = data.get("status", "").strip()
        if status not in VALID_STATUSES:
            return make_error(f"Invalid status. Must be one of: {', '.join(VALID_STATUSES)}", 400)

        updated = update_application_status(app_id, status)
        if not updated:
            return make_error("Application not found or status already set", 404)

        return make_success(message=f"Application status updated to '{status}'", status_code=200)

    except Exception as e:
        current_app.logger.error(f"Update application status error: {e}")
        return make_error("Failed to update application status", 500)
