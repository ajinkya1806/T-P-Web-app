"""
Helper utilities for JSON serialization and standard API responses.
"""
from bson import ObjectId
from datetime import datetime
from flask import jsonify


def serialize_doc(doc: dict) -> dict:
    """
    Convert a raw MongoDB document to a JSON-serializable dict.
    Handles ObjectId → str and datetime → ISO string recursively.
    """
    if doc is None:
        return None

    result = {}
    for key, value in doc.items():
        if isinstance(value, ObjectId):
            result[key] = str(value)
        elif isinstance(value, datetime):
            result[key] = value.isoformat()
        elif isinstance(value, dict):
            result[key] = serialize_doc(value)
        elif isinstance(value, list):
            result[key] = [
                serialize_doc(item) if isinstance(item, dict)
                else str(item) if isinstance(item, ObjectId)
                else item
                for item in value
            ]
        else:
            result[key] = value
    return result


def serialize_list(docs: list) -> list:
    """Serialize a list of MongoDB documents."""
    return [serialize_doc(doc) for doc in docs]


def make_error(message: str, status_code: int = 400):
    """Return a standard JSON error response."""
    return jsonify({"error": message}), status_code


def make_success(data=None, message: str = "Success", status_code: int = 200):
    """Return a standard JSON success response."""
    response = {"message": message}
    if data is not None:
        response["data"] = data
    return jsonify(response), status_code
