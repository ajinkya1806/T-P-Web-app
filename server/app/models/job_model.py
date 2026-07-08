"""
Job Model — Data access helpers for the 'jobs' collection.

Schema:
{
    "_id":         ObjectId,
    "companyName": str,
    "title":       str,
    "description": str,
    "packageLPA":  float,
    "eligibility": {
        "minCgpa":  float,
        "branches": [str]   # e.g. ["CS", "IT", "EXTC"]
    },
    "deadline":    datetime,
    "status":      "Active" | "Closed",
    "createdBy":   ObjectId (ref → users._id, admin),
    "createdAt":   datetime
}
"""
from datetime import datetime, timezone
from bson import ObjectId
from flask import current_app


def get_jobs_col():
    return current_app.db["jobs"]


def get_all_jobs(status_filter: str = None) -> list:
    query = {}
    if status_filter:
        query["status"] = status_filter
    return list(get_jobs_col().find(query).sort("createdAt", -1))


def find_job_by_id(job_id: str) -> dict | None:
    try:
        return get_jobs_col().find_one({"_id": ObjectId(job_id)})
    except Exception:
        return None


def create_job(data: dict, created_by: str) -> str:
    doc = {
        "companyName": data.get("companyName", ""),
        "title": data.get("title", ""),
        "description": data.get("description", ""),
        "packageLPA": float(data.get("packageLPA", 0)),
        "eligibility": {
            "minCgpa": float(data.get("eligibility", {}).get("minCgpa", 0.0)),
            "branches": data.get("eligibility", {}).get("branches", []),
        },
        "deadline": data.get("deadline"),   # Expected as ISO string; parsed by route
        "status": "Active",
        "createdBy": ObjectId(created_by),
        "createdAt": datetime.now(timezone.utc),
    }
    result = get_jobs_col().insert_one(doc)
    return str(result.inserted_id)


def update_job(job_id: str, updates: dict) -> bool:
    allowed = {"companyName", "title", "description", "packageLPA",
               "eligibility", "deadline", "status"}
    clean = {k: v for k, v in updates.items() if k in allowed}
    if not clean:
        return False
    result = get_jobs_col().update_one(
        {"_id": ObjectId(job_id)},
        {"$set": clean}
    )
    return result.modified_count > 0


def delete_job(job_id: str) -> bool:
    try:
        result = get_jobs_col().delete_one({"_id": ObjectId(job_id)})
        return result.deleted_count > 0
    except Exception:
        return False
