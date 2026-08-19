from django.contrib import admin
from django_tenants.admin import TenantAdminMixin

from .models import *

@admin.register(Hospital)
class HospitalAdmin(TenantAdminMixin, admin.ModelAdmin):
    list_display = ("name", "schema_name")

admin.site.register(Domain)
