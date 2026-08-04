from django.db import models
from django.conf import settings

class Patient(models.Model):  
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        # making this field optinal in case he's just a visitor
        null = True,
        blank = True,
        related_name='patient',
        unique=True
    )
    first_name = models.CharField(max_length=50, blank=True, default='')
    last_name = models.CharField(max_length=50, blank=True, default='')

    personal_id = models.CharField(max_length=100, blank=True)
    birth_date = models.DateField()
    
    # Renamed the inner class to Gender to avoid confusing it with 'User.Role'
    class Gender(models.TextChoices):
        FEMALE = 'female', 'Female'
        MALE = 'male', 'Male'
        UNKNOWN = 'unknown', 'Unknown' 
        
    gender = models.CharField(max_length=10, choices=Gender.choices, default=Gender.UNKNOWN)
    phone_number = models.CharField(max_length=15, blank=True)
    class BloodType(models.TextChoices):
        OP = 'O+', 'O+'
        OM = 'O-', 'O-'
        AP = 'A+', 'A+'
        AM = 'A-', 'A-'
        BP = 'B+', 'B+'
        BM = 'B-', 'B-'
        ABP = 'AB+', 'AB+'
        ABM = 'AB-', 'AB-'
        UNKNOWN = 'unknown', 'Unknown'
    
    blood_type = models.CharField(max_length=10, choices=BloodType.choices, default=BloodType.UNKNOWN)
    @property
    def no_show_count(self) -> int:
        """Returns the total number of NO_SHOW appointments for this patient."""
        # 'appointments' assumes related_name='appointments' on Appointment.patient
        return self.appointments.filter(status="no_show").count()    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"
    
    def save(self, *args, **kwargs):
        # If linked to a User, sync names from User if not manually specified
        if self.user:
            if not self.first_name:
                self.first_name = self.user.first_name
            if not self.last_name:
                self.last_name = self.user.last_name
                
        super().save(*args, **kwargs)

