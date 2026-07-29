from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class User(AbstractUser):
    # inherit TextChoices and 
    class Role(models.TextChoices):
        # make the choices
        PLATFORM_ADMIN = 'platform_admin', 'Platform Admin'
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
    
    expired_at = models.DateTimeField(
        null=True,
        blank=True
    )
    # create a role field                   give it the choices
    role = models.CharField(max_length=50, choices=Role.choices, default=Role.PATIENT)
    email = models.EmailField(unique=True)
    date_joined = models.DateTimeField(default=timezone.now)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.username
