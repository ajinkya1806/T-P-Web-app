"""
Auth Routes — /api/auth
========================
Handles login, registration, token refresh, and current-user info.

Design decisions:
- Single /login endpoint for all roles (admin & student)
- Role is embedded as a custom claim in the JWT (not just the identity)
- Admin bootstrap: first admin can be created freely; subsequent ones require an existing admin JWT
- Students are created by admins only
"""
from flask import Blueprint, request, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from datetime import datetime, timezone

from ..models.user_model import (
    find_user_by_email,
    find_user_by_id,
    create_user,
    count_admins,
)
from ..models.student_model import create_profile
from ..utils.helpers import make_error, make_success, serialize_doc
from ..utils.decorators import admin_required

auth_bp = Blueprint("auth", __name__)


# ── POST /api/auth/login ───────────────────────────────────────────────────────
@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Unified login for all roles.
    Body: { "email": str, "password": str }
    Returns: { "token": str, "user": { id, name, email, role } }
    """
    try:
        data = request.get_json(silent=True)
        if not data:
            return make_error("Request body must be JSON", 400)

        email = data.get("email", "").strip()
        password = data.get("password", "")

        if not email or not password:
            return make_error("Email and password are required", 400)

        user = find_user_by_email(email)
        if not user:
            return make_error("Invalid email or password", 401)

        from .. import bcrypt
        if not bcrypt.check_password_hash(user["password"], password):
            return make_error("Invalid email or password", 401)

        # Embed role as a custom claim so decorators can read it without a DB hit
        additional_claims = {"role": user["role"]}
        token = create_access_token(
            identity=str(user["_id"]),
            additional_claims=additional_claims,
        )

        return make_success(
            data={
                "token": token,
                "user": {
                    "id": str(user["_id"]),
                    "name": user["name"],
                    "email": user["email"],
                    "role": user["role"],
                },
            },
            message="Login successful",
            status_code=200,
        )

    except Exception as e:
        current_app.logger.error(f"Login error: {e}")
        return make_error("An internal error occurred", 500)


# ── POST /api/auth/register/admin ──────────────────────────────────────────────
@auth_bp.route("/register/admin", methods=["POST"])
def register_admin():
    """
    Bootstrap-protected admin registration.
    - If 0 admins exist in DB: open to anyone (first-time setup).
    - If admins already exist: requires a valid admin JWT.
    Body: { "name": str, "email": str, "password": str }
    """
    try:
        from .. import bcrypt

        # Bootstrap protection: only allow open registration if no admins exist
        if count_admins() > 0:
            # Require admin JWT for subsequent admin creation
            from flask_jwt_extended import verify_jwt_in_request
            try:
                verify_jwt_in_request()
                claims = get_jwt()
                if claims.get("role") != "admin":
                    return make_error("Only existing admins can create new admins", 403)
            except Exception:
                return make_error("Admin JWT required to create another admin", 401)

        data = request.get_json(silent=True)
        if not data:
            return make_error("Request body must be JSON", 400)

        name = data.get("name", "").strip()
        email = data.get("email", "").strip()
        password = data.get("password", "")

        if not name or not email or not password:
            return make_error("name, email, and password are required", 400)

        if len(password) < 6:
            return make_error("Password must be at least 6 characters", 400)

        if find_user_by_email(email):
            return make_error("An account with this email already exists", 409)

        hashed = bcrypt.generate_password_hash(password).decode("utf-8")
        user_id = create_user(name=name, email=email, hashed_password=hashed, role="admin")

        return make_success(
            data={"id": user_id, "name": name, "email": email, "role": "admin"},
            message="Admin account created successfully",
            status_code=201,
        )

    except Exception as e:
        current_app.logger.error(f"Admin registration error: {e}")
        return make_error("An internal error occurred", 500)


# ── POST /api/auth/register/student ───────────────────────────────────────────
@auth_bp.route("/register/student", methods=["POST"])
@admin_required
def register_student():
    """
    Admin-only: create a student account + empty profile.
    Body: { "name": str, "email": str, "password": str, "prn": str, "branch": str, "year": int }
    """
    try:
        from .. import bcrypt

        data = request.get_json(silent=True)
        if not data:
            return make_error("Request body must be JSON", 400)

        name = data.get("name", "").strip()
        email = data.get("email", "").strip()
        password = data.get("password", "")
        prn = data.get("prn", "").strip()
        branch = data.get("branch", "").strip()
        year = int(data.get("year", 1))

        if not name or not email or not password:
            return make_error("name, email, and password are required", 400)

        if len(password) < 6:
            return make_error("Password must be at least 6 characters", 400)

        if find_user_by_email(email):
            return make_error("An account with this email already exists", 409)

        hashed = bcrypt.generate_password_hash(password).decode("utf-8")
        user_id = create_user(name=name, email=email, hashed_password=hashed, role="student")

        # Create an empty student profile linked to this user
        create_profile(
            user_id=user_id,
            prn=prn,
            branch=branch,
            year=year,
        )

        return make_success(
            data={"id": user_id, "name": name, "email": email, "role": "student"},
            message="Student account created successfully",
            status_code=201,
        )

    except Exception as e:
        current_app.logger.error(f"Student registration error: {e}")
        return make_error("An internal error occurred", 500)


# ── GET /api/auth/me ───────────────────────────────────────────────────────────
@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
    """
    Returns the current authenticated user's info.
    Requires: Bearer <token>
    """
    try:
        user_id = get_jwt_identity()
        user = find_user_by_id(user_id)

        if not user:
            return make_error("User not found", 404)

        return make_success(
            data={
                "id": str(user["_id"]),
                "name": user["name"],
                "email": user["email"],
                "role": user["role"],
                "createdAt": user.get("createdAt", "").isoformat()
                if isinstance(user.get("createdAt"), datetime)
                else str(user.get("createdAt", "")),
            },
            status_code=200,
        )

    except Exception as e:
        current_app.logger.error(f"Get current user error: {e}")
        return make_error("An internal error occurred", 500)


# ── POST /api/auth/logout ──────────────────────────────────────────────────────
@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    """
    Acknowledge logout. JWT invalidation is handled client-side (delete token from storage).
    For stateless JWTs, the server simply acknowledges; the client drops the token.
    """
    return make_success(message="Logged out successfully", status_code=200)
