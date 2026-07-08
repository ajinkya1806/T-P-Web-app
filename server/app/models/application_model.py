"""
Application Model — Data access helpers for the 'applications' collection.

Schema:
{
    "_id":       ObjectId,
    "jobId":     ObjectId (ref → jobs._id),
    "studentId": ObjectId (ref → users._id),
    "status":    "Applied" | "Shortlisted" | "Hired" | "Rejected",
    "appliedAt": datetime
}
"""
from datetime import datetime, timezone
from bson import ObjectId
from flask import current_app


def get_apps_col():
    return current_app.db["applications"]


def find_application(job_id: str, student_id: str) -> dict | None:
    """Check if a student has already applied to a job."""
    try:
        return get_apps_col().find_one({
            "jobId":     ObjectId(job_id),
            "studentId": ObjectId(student_id),
        })
    except Exception:
        return None


def create_application(job_id: str, student_id: str) -> str:
    doc = {
        "jobId":     ObjectId(job_id),
        "studentId": ObjectId(student_id),
        "status":    "Applied",
        "appliedAt": datetime.now(timezone.utc),
    }
    result = get_apps_col().insert_one(doc)
    return str(result.inserted_id)


def get_applications_by_student(student_id: str) -> list:
    return list(get_apps_col().find({"studentId": ObjectId(student_id)}))


def get_applications_by_job(job_id: str) -> list:
    return list(get_apps_col().find({"jobId": ObjectId(job_id)}))


def update_application_status(application_id: str, status: str) -> bool:
    valid = {"Applied", "Shortlisted", "Hired", "Rejected"}
    if status not in valid:
        return False
    result = get_apps_col().update_one(
        {"_id": ObjectId(application_id)},
        {"$set": {"status": status}}
    )
    return result.modified_count > 0


def delete_applications_by_job(job_id: str) -> int:
    result = get_apps_col().delete_many({"jobId": ObjectId(job_id)})
    return result.deleted_count
