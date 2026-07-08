"""
Event Model — Data access helpers for the 'events' collection.

Schema:
{
    "_id":         ObjectId,
    "type":        "PPT" | "Interview" | "Test" | "Workshop" | "Other",
    "title":       str,
    "date":        datetime,
    "description": str,
    "createdBy":   ObjectId (ref → users._id),
    "createdAt":   datetime
}
"""
from datetime import datetime, timezone
from bson import ObjectId
from flask import current_app


def get_events_col():
    return current_app.db["events"]


def get_all_events() -> list:
    return list(get_events_col().find().sort("date", 1))  # ascending by date


def find_event_by_id(event_id: str) -> dict | None:
    try:
        return get_events_col().find_one({"_id": ObjectId(event_id)})
    except Exception:
        return None


def get_upcoming_events(limit: int = 5) -> list:
    now = datetime.now(timezone.utc)
    return list(
        get_events_col()
        .find({"date": {"$gte": now}})
        .sort("date", 1)
        .limit(limit)
    )


def create_event(data: dict, created_by: str) -> str:
    doc = {
        "type": data.get("type", "Other"),
        "title": data.get("title", ""),
        "date": data.get("date"),       # Expected as datetime; parsed by route
        "description": data.get("description", ""),
        "createdBy": ObjectId(created_by),
        "createdAt": datetime.now(timezone.utc),
    }
    result = get_events_col().insert_one(doc)
    return str(result.inserted_id)


def update_event(event_id: str, updates: dict) -> bool:
    allowed = {"type", "title", "date", "description"}
    clean = {k: v for k, v in updates.items() if k in allowed}
    if not clean:
        return False
    result = get_events_col().update_one(
        {"_id": ObjectId(event_id)},
        {"$set": clean}
    )
    return result.modified_count > 0


def delete_event(event_id: str) -> bool:
    try:
        result = get_events_col().delete_one({"_id": ObjectId(event_id)})
        return result.deleted_count > 0
    except Exception:
        return False
