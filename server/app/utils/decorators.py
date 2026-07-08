"""
Role-based access control decorators for Flask routes.

Usage:
    @app.route('/api/admin/stats')
    @admin_required
    def stats():
        ...
"""
import functools
from flask import current_app
from flask_jwt_extended import verify_jwt_in_request, get_jwt
from .helpers import make_error


def admin_required(fn):
    """
    Decorator that verifies a valid JWT exists AND the identity role is 'admin'.
    Returns 401 if no/invalid token, 403 if role is not admin.
    """
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
        except Exception:
            return make_error("Authentication required", 401)

        claims = get_jwt()
        if claims.get("role") != "admin":
            return make_error("Admin access required", 403)

        return fn(*args, **kwargs)
    return wrapper


def student_required(fn):
    """
    Decorator that verifies a valid JWT exists AND the identity role is 'student'.
    Returns 401 if no/invalid token, 403 if role is not student.
    """
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
        except Exception:
            return make_error("Authentication required", 401)

        claims = get_jwt()
        if claims.get("role") != "student":
            return make_error("Student access required", 403)

        return fn(*args, **kwargs)
    return wrapper


def jwt_required_any(fn):
    """
    Decorator that requires a valid JWT of ANY role (admin or student).
    """
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
        except Exception:
            return make_error("Authentication required", 401)
        return fn(*args, **kwargs)
    return wrapper
