from django.contrib import admin
from .models import PatientCondition, MedicalDocument

@admin.register(PatientCondition)
class MedicalHistoryAdmin(admin.ModelAdmin):
    pass

@admin.register(MedicalDocument)
class MedicalDocumentAdmin(admin.ModelAdmin):
    pass