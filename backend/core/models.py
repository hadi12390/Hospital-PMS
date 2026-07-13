from django.db import models
from django.conf import settings

class Doctor(models.Model):  # Changed to singular
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        limit_choices_to={'role': 'doctor'}, 
        related_name='doctor'
    )
    specialty = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=15, blank=True)
    start_time = models.TimeField()
    end_time = models.TimeField()

    def __str__(self):
        return f"Dr. {self.user.get_full_name() or self.user.username}"


class Patient(models.Model):  # Changed to singular
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        limit_choices_to={'role': 'patient'}, 
        related_name='patient'  # Fixed plural naming style
    )
    birth_date = models.DateField()
    
    # Renamed the inner class to Gender to avoid confusing it with 'User.Role'
    class Gender(models.TextChoices):
        FEMALE = 'female', 'Female'
        MALE = 'male', 'Male'
        UNKNOWN = 'unknown', 'Unknown' 
        
    gender = models.CharField(max_length=10, choices=Gender.choices, default=Gender.UNKNOWN)
    phone_number = models.CharField(max_length=15, blank=True)

    def __str__(self):
        return self.user.get_full_name() or self.user.username


class Appointment(models.Model):  # Changed to singular
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='appointments')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='appointments')
    
    # This single field handles day AND hour/minute perfectly
    scheduled_time = models.DateTimeField() 
    
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        CONFIRMED = 'confirmed', 'Confirmed'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'
        
    # Bumped max_length up to 20 to safely hold 'confirmed' and 'cancelled'
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    notes = models.TextField(max_length=1000, blank=True) # Added blank=True so notes are optional

    def __str__(self):
        return f"Appointment: {self.patient} with {self.doctor} on {self.scheduled_time}"