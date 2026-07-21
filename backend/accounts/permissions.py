from rest_framework.permissions import BasePermission

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

        # 3. Safe check for related profile without explicit DB queries
        # (Works for OneToOne fields)
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
            request.user and 
            request.user.is_authenticated and 
            request.user.role == "patient" and
            getattr(request.user, "patient", None) is None  # Must NOT exist yet
        )