from django.contrib import admin
from .models import ClinicConfiguration

@admin.register(ClinicConfiguration)
class ConfigAdmin(admin.ModelAdmin):
    pass