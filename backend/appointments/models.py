from django.db import models
from doctor.models import Doctor
from patient.models import Patient

class Appointment(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.SET_NULL, null=True, related_name='appointments')
    patient = models.ForeignKey(Patient, on_delete=models.SET_NULL, null=True, related_name='appointments')
    
    # This single field handles day AND hour/minute perfectly
    scheduled_time = models.DateTimeField() 
    
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        CONFIRMED = 'confirmed', 'Confirmed'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'
        NO_SHOW = "no_show", "No Show"

    reason_for_visit = models.CharField(max_length=255, blank=True, help_text="The patient's primary symptoms or reason for booking.")
    # Bumped max_length up to 20 to safely hold 'confirmed' and 'cancelled'
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    notes = models.TextField(max_length=1000, blank=True) # Added blank=True so notes are optional
    confirmed_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    def __str__(self):
        return f"Appointment: {self.patient} with {self.doctor} on {self.scheduled_time}"
