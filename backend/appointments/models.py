from django.db import models
from django.utils import timezone
from doctor.models import Doctor
from patient.models import Patient
from datetime import timedelta

class Appointment(models.Model):

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        CONFIRMED = "confirmed", "Confirmed"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"
        NO_SHOW = "no_show", "No Show"

    class AppointmentType(models.TextChoices):
        CONSULTATION = "consultation", "Consultation"
        FOLLOW_UP = "follow_up", "Follow-up"
        CHECKUP = "checkup", "Checkup"

    doctor = models.ForeignKey(
        Doctor,
        on_delete=models.SET_NULL,
        null=True,
        related_name="appointments"
    )

    patient = models.ForeignKey(
        Patient,
        on_delete=models.SET_NULL,
        null=True,
        related_name="appointments"
    )

    reason_for_visit = models.CharField(
        max_length=255,
        blank=True,
        help_text="The patient's primary symptoms or reason for booking."
    )

    appointment_type = models.CharField(
        max_length=20,
        choices=AppointmentType.choices,
        default=AppointmentType.CONSULTATION
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )

    scheduled_time = models.DateTimeField()

    @property
    def end_time(self):
        if not self.doctor:
            return None
 
        durations = {
            self.AppointmentType.CONSULTATION: self.doctor.consultation_duration,
            self.AppointmentType.FOLLOW_UP: self.doctor.follow_up_duration,
            self.AppointmentType.CHECKUP: self.doctor.checkup_duration,
        }

        return self.scheduled_time + timedelta(
            minutes=durations[self.appointment_type]
        )

    notes = models.TextField(
        max_length=1000,
        blank=True
    )

    # Record creation time
    created_at = models.DateTimeField(
        default=timezone.now
    )

    # Status change history
    confirmed_at = models.DateTimeField(
        null=True,
        blank=True
    )

    completed_at = models.DateTimeField(
        null=True,
        blank=True
    )

    cancelled_at = models.DateTimeField(
        null=True,
        blank=True
    )


    class Meta:
        ordering = ["scheduled_time"]


    def __str__(self):
        return (
            f"Appointment: {self.patient} "
            f"with {self.doctor} "
            f"on {self.scheduled_time}"
        )