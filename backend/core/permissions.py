from rest_framework.permissions import BasePermission
from django.db import connection

class IsValidTenantUser(BasePermission):
    """
    Blocks any request where the JWT tenant_schema does not match 
    the current database schema.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Get the tenant_schema embedded in the JWT payload
        token_schema = request.auth.get('tenant_schema') if request.auth else None
        
        # Verify it matches the active PostgreSQL schema
        return token_schema == connection.schema_name