from django.db import models
from django.conf import settings

class Doctor(models.Model):  
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        limit_choices_to={'role': 'doctor'}, 
        related_name='doctor'
    )
    specialty = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=15, blank=True)
    start_time = models.TimeField(blank=True)
    end_time = models.TimeField(blank=True)
    created_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return f"Dr. {self.user.get_full_name() or self.user.username}"
