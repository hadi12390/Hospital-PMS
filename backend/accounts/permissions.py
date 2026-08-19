from rest_framework.permissions import BasePermission
from .models import User  # adjust import path to wherever your User model lives


class BaseRolePermission(BasePermission):
    role_name = None       # e.g., 'doctor'
    profile_attr = None    # e.g., 'doctor'

    def has_permission(self, request, view):
        # 1. Basic authentication check
        if not (request.user and request.user.is_authenticated):
            return False

        # 2. Check role on user model
        if request.user.role != self.role_name:
            return False

        # 3. Check if user is active
        if request.user.status != User.Status.ACTIVE:
            return False

        # 4. Check related profile existence.
        # getattr(..., None) safely catches RelatedObjectDoesNotExist for
        # reverse OneToOne fields, but note this can still trigger a DB
        # query unless request.user was fetched with select_related.
        return getattr(request.user, self.profile_attr, None) is not None


class IsManager(BaseRolePermission):
    role_name = "manager"
    profile_attr = "manager"


class IsDoctor(BaseRolePermission):
    role_name = "doctor"
    profile_attr = "doctor"


class IsPatient(BaseRolePermission):
    role_name = "patient"
    profile_attr = "patient"


class IsUnregisteredPatient(BasePermission):
    """
    Allows access only to authenticated users with role='patient'
    who have NOT created their Patient profile yet.
    """

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == "patient"
            and request.user.status == User.Status.ACTIVE
            and getattr(request.user, "patient", None) is None  # Must NOT exist yet
        )