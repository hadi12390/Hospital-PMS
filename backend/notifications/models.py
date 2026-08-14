from django.db import models
from django.conf import settings
import uuid

class Notification(models.Model):

    class Type(models.TextChoices):
        APPOINTMENT = "appointment", "Appointment"
        REMINDER = "reminder", "Reminder"

    public_id = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False,
        db_index=True,
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    appointment = models.ForeignKey(
        "appointments.Appointment",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="notifications",
    )
    
    notification_type = models.CharField(max_length=20, choices=Type.choices)
    title = models.CharField(max_length=100)
    message = models.TextField()


    is_read = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    @classmethod
    def create_notification(cls, user, notification_type, title, message, appointment=None):
        return cls.objects.create(
            user=user,
            notification_type=notification_type,
            title=title,
            message=message,
            appointment=appointment,
        )