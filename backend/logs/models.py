from django.db import models
from django.conf import settings

class ActivityLog(models.Model):
    class Action(models.TextChoices):
        REGISTER = "register", "Register"
        EMAIL_VERIFIED = "email_verified", "Email Verified"
        APPOINTMENT_CREATED = "appointment_created", "Appointment Created"
        APPOINTMENT_UPDATED = "appointment_updated", "Appointment Updated"
        APPOINTMENT_DELETED = "appointment_deleted", "Appointment Deleted"
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="activities"
    )   

    action = models.CharField(max_length=50, choices=Action.choices)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.action}: from {self.user}"