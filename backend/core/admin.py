from django.contrib import admin
from .models import Doctor, Patient, Appointment, MedicalHistory, MedicalDocument, Manager

@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    pass

@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    pass

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    pass

@admin.register(MedicalHistory)
class MedicalHistoryAdmin(admin.ModelAdmin):
    pass

@admin.register(MedicalDocument)
class MedicalDocumentAdmin(admin.ModelAdmin):
    pass

@admin.register(Manager)
class ManagerAdmin(admin.ModelAdmin):
    pass