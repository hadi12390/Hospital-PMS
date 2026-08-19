from django.contrib import admin
from .models import ClinicConfiguration, ReliabilityPolicy

@admin.register(ClinicConfiguration)
class ConfigAdmin(admin.ModelAdmin):
    pass

@admin.register(ReliabilityPolicy)
class PolicyAdmin(admin.ModelAdmin):
    pass