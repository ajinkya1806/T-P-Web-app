"""
Job Routes — /api/jobs
========================
GET (list/detail): any authenticated user
POST/PUT/DELETE: admin only
"""
from flask import Blueprint, request, current_app
from flask_jwt_extended import get_jwt_identity
from datetime import datetime, timezone

from ..models.job_model import (
    get_all_jobs,
    find_job_by_id,
    create_job,
    update_job,
    delete_job,
)
from ..utils.helpers import make_error, make_success, serialize_doc, serialize_list
from ..utils.decorators import admin_required, jwt_required_any

job_bp = Blueprint("jobs", __name__)


def _parse_deadline(deadline_str: str):
    """Parse ISO deadline string into a timezone-aware datetime."""
    if not deadline_str:
        return None
    try:
        dt = datetime.fromisoformat(deadline_str.replace("Z", "+00:00"))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    except (ValueError, AttributeError):
        return None


# ── GET /api/jobs ─────────────────────────────────────────────────────────────
@job_bp.route("/", methods=["GET"])
@jwt_required_any
def list_jobs():
    """
    List all jobs. Admins see all; students see only Active ones.
    Optional query: ?status=Active|Closed
    """
    try:
        from flask_jwt_extended import get_jwt
        claims = get_jwt()
        role = claims.get("role")

        status_filter = request.args.get("status")

        # Students can only see active jobs
        if role == "student":
            status_filter = "Active"

        jobs = get_all_jobs(status_filter=status_filter)
        return make_success(data=serialize_list(jobs), status_code=200)

    except Exception as e:
        current_app.logger.error(f"List jobs error: {e}")
        return make_error("Failed to fetch jobs", 500)


# ── GET /api/jobs/<id> ────────────────────────────────────────────────────────
@job_bp.route("/<string:job_id>", methods=["GET"])
@jwt_required_any
def get_job(job_id):
    """Get a single job by ID."""
    try:
        job = find_job_by_id(job_id)
        if not job:
            return make_error("Job not found", 404)
        return make_success(data=serialize_doc(job), status_code=200)

    except Exception as e:
        current_app.logger.error(f"Get job error: {e}")
        return make_error("Failed to fetch job", 500)


# ── POST /api/jobs ────────────────────────────────────────────────────────────
@job_bp.route("/", methods=["POST"])
@admin_required
def create_new_job():
    """
    Create a new job posting.
    Body: {
        "companyName": str, "title": str, "description": str,
        "packageLPA": float,
        "eligibility": { "minCgpa": float, "branches": [str] },
        "deadline": "ISO-8601 datetime string"
    }
    """
    try:
        data = request.get_json(silent=True)
        if not data:
            return make_error("Request body must be JSON", 400)

        required = ["companyName", "title", "packageLPA", "deadline"]
        missing = [f for f in required if not data.get(f)]
        if missing:
            return make_error(f"Missing required fields: {', '.join(missing)}", 400)

        # Parse and inject deadline as datetime
        deadline = _parse_deadline(str(data.get("deadline", "")))
        if not deadline:
            return make_error("Invalid deadline format. Use ISO 8601 (e.g. 2024-12-31T00:00:00Z)", 400)
        data["deadline"] = deadline

        admin_id = get_jwt_identity()
        job_id = create_job(data=data, created_by=admin_id)

        return make_success(
            data={"id": job_id},
            message="Job posted successfully",
            status_code=201,
        )

    except Exception as e:
        current_app.logger.error(f"Create job error: {e}")
        return make_error("Failed to create job", 500)


# ── PUT /api/jobs/<id> ────────────────────────────────────────────────────────
@job_bp.route("/<string:job_id>", methods=["PUT"])
@admin_required
def update_existing_job(job_id):
    """Update a job posting. Partial updates supported."""
    try:
        job = find_job_by_id(job_id)
        if not job:
            return make_error("Job not found", 404)

        data = request.get_json(silent=True)
        if not data:
            return make_error("Request body must be JSON", 400)

        # Parse deadline if provided
        if "deadline" in data:
            deadline = _parse_deadline(str(data["deadline"]))
            if not deadline:
                return make_error("Invalid deadline format. Use ISO 8601", 400)
            data["deadline"] = deadline

        update_job(job_id, data)
        return make_success(message="Job updated successfully", status_code=200)

    except Exception as e:
        current_app.logger.error(f"Update job error: {e}")
        return make_error("Failed to update job", 500)


# ── DELETE /api/jobs/<id> ─────────────────────────────────────────────────────
@job_bp.route("/<string:job_id>", methods=["DELETE"])
@admin_required
def delete_existing_job(job_id):
    """Delete a job posting."""
    try:
        job = find_job_by_id(job_id)
        if not job:
            return make_error("Job not found", 404)

        delete_job(job_id)
        return make_success(message="Job deleted successfully", status_code=200)

    except Exception as e:
        current_app.logger.error(f"Delete job error: {e}")
        return make_error("Failed to delete job", 500)
