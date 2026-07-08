"""
Event Routes — /api/events
===========================
GET: any authenticated user
POST/PUT/DELETE: admin only
"""
from flask import Blueprint, request, current_app
from flask_jwt_extended import get_jwt_identity
from datetime import datetime, timezone

from ..models.event_model import (
    get_all_events,
    find_event_by_id,
    get_upcoming_events,
    create_event,
    update_event,
    delete_event,
)
from ..utils.helpers import make_error, make_success, serialize_doc, serialize_list
from ..utils.decorators import admin_required, jwt_required_any

event_bp = Blueprint("events", __name__)

VALID_EVENT_TYPES = {"PPT", "Interview", "Test", "Workshop", "Other"}


def _parse_date(date_str: str):
    """Parse ISO date string into a timezone-aware datetime."""
    if not date_str:
        return None
    try:
        dt = datetime.fromisoformat(str(date_str).replace("Z", "+00:00"))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    except (ValueError, AttributeError):
        return None


# ── GET /api/events ───────────────────────────────────────────────────────────
@event_bp.route("/", methods=["GET"])
@jwt_required_any
def list_events():
    """
    List all events sorted by date ascending.
    Optional query: ?upcoming=true  (returns only future events, max 10)
    """
    try:
        upcoming_only = request.args.get("upcoming", "").lower() == "true"

        if upcoming_only:
            events = get_upcoming_events(limit=10)
        else:
            events = get_all_events()

        return make_success(data=serialize_list(events), status_code=200)

    except Exception as e:
        current_app.logger.error(f"List events error: {e}")
        return make_error("Failed to fetch events", 500)


# ── GET /api/events/<id> ──────────────────────────────────────────────────────
@event_bp.route("/<string:event_id>", methods=["GET"])
@jwt_required_any
def get_event(event_id):
    """Get a single event by ID."""
    try:
        event = find_event_by_id(event_id)
        if not event:
            return make_error("Event not found", 404)
        return make_success(data=serialize_doc(event), status_code=200)

    except Exception as e:
        current_app.logger.error(f"Get event error: {e}")
        return make_error("Failed to fetch event", 500)


# ── POST /api/events ──────────────────────────────────────────────────────────
@event_bp.route("/", methods=["POST"])
@admin_required
def create_new_event():
    """
    Create a new event.
    Body: {
        "type": "PPT"|"Interview"|"Test"|"Workshop"|"Other",
        "title": str,
        "date": "ISO-8601 datetime string",
        "description": str
    }
    """
    try:
        data = request.get_json(silent=True)
        if not data:
            return make_error("Request body must be JSON", 400)

        required = ["type", "title", "date"]
        missing = [f for f in required if not data.get(f)]
        if missing:
            return make_error(f"Missing required fields: {', '.join(missing)}", 400)

        event_type = data.get("type", "").strip()
        if event_type not in VALID_EVENT_TYPES:
            return make_error(
                f"Invalid event type. Must be one of: {', '.join(VALID_EVENT_TYPES)}", 400
            )

        date = _parse_date(data.get("date"))
        if not date:
            return make_error("Invalid date format. Use ISO 8601 (e.g. 2024-12-15T10:00:00Z)", 400)

        admin_id = get_jwt_identity()
        event_data = {
            "type": event_type,
            "title": data.get("title", "").strip(),
            "date": date,
            "description": data.get("description", "").strip(),
        }
        event_id = create_event(data=event_data, created_by=admin_id)

        return make_success(
            data={"id": event_id},
            message="Event created successfully",
            status_code=201,
        )

    except Exception as e:
        current_app.logger.error(f"Create event error: {e}")
        return make_error("Failed to create event", 500)


# ── PUT /api/events/<id> ──────────────────────────────────────────────────────
@event_bp.route("/<string:event_id>", methods=["PUT"])
@admin_required
def update_existing_event(event_id):
    """Update an event. Partial updates supported."""
    try:
        event = find_event_by_id(event_id)
        if not event:
            return make_error("Event not found", 404)

        data = request.get_json(silent=True)
        if not data:
            return make_error("Request body must be JSON", 400)

        # Validate type if provided
        if "type" in data and data["type"] not in VALID_EVENT_TYPES:
            return make_error(
                f"Invalid event type. Must be one of: {', '.join(VALID_EVENT_TYPES)}", 400
            )

        # Parse date if provided
        if "date" in data:
            parsed = _parse_date(data["date"])
            if not parsed:
                return make_error("Invalid date format. Use ISO 8601", 400)
            data["date"] = parsed

        update_event(event_id, data)
        return make_success(message="Event updated successfully", status_code=200)

    except Exception as e:
        current_app.logger.error(f"Update event error: {e}")
        return make_error("Failed to update event", 500)


# ── DELETE /api/events/<id> ───────────────────────────────────────────────────
@event_bp.route("/<string:event_id>", methods=["DELETE"])
@admin_required
def delete_existing_event(event_id):
    """Delete an event."""
    try:
        event = find_event_by_id(event_id)
        if not event:
            return make_error("Event not found", 404)

        delete_event(event_id)
        return make_success(message="Event deleted successfully", status_code=200)

    except Exception as e:
        current_app.logger.error(f"Delete event error: {e}")
        return make_error("Failed to delete event", 500)
