from django.db import models, connection
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
import uuid
from .validators import validate_image_file, validate_avatar_size


def user_avatar_path(instance, filename):
    ext = filename.split('.')[-1]
    return f'avatars/{connection.schema_name}/{instance.public_id}.{ext}'


class User(AbstractUser):
    id = models.BigAutoField(primary_key=True)

    public_id = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False,
        db_index=True,
    )

    class Role(models.TextChoices):
        MANAGER = 'manager', 'Manager'
        DOCTOR = 'doctor', 'Doctor'
        PATIENT = 'patient', 'Patient'

    class Status(models.TextChoices):
        ACTIVE = "active"
        EXPIRED = "expired"
        DISABLED = 'disabled', 'Disabled'

    status = models.CharField(
        max_length=50,
        choices=Status.choices,
        default=Status.ACTIVE
    )
    first_name = models.CharField(max_length=50, blank=False, null=False)
    last_name = models.CharField(max_length=50, blank=False, null=False)
    expired_at = models.DateTimeField(null=True, blank=True)
    role = models.CharField(max_length=50, choices=Role.choices, default=Role.PATIENT)
    email = models.EmailField(unique=True)
    date_joined = models.DateTimeField(default=timezone.now)

    profile_picture = models.ImageField(
        upload_to=user_avatar_path,
        null=True,
        blank=True,
        validators=[validate_image_file, validate_avatar_size],
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.username
    