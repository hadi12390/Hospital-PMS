from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    # inherit TextChoices and 
    class Role(models.TextChoices):
        # make the choices
        MANAGER = 'manager', 'Manager'
        DOCTOR = 'doctor', 'Doctor'
        PATIENT = 'patient', 'Patient'
    
    # create a role field                   give it the choices
    role = models.CharField(max_length=50, choices=Role.choices, default=Role.PATIENT)
    email = models.EmailField(unique=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.username
