from django.db import models
from django.conf import settings
from configuration.models import ClinicConfiguration
from django.db.models import Count, Q, F
from datetime import timedelta

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
    
    @property
    def reliability(self):

        config = ClinicConfiguration.get_solo()

        stats = self.appointments.aggregate(
            completed=Count(
                "id",
                filter=Q(status="completed")
            ),
            no_show=Count(
                "id",
                filter=Q(status="no_show")
            ),
            early_cancelled=Count(
                "id",
                filter=Q(
                    status="cancelled",
                    cancelled_at__lte=F("scheduled_time") - timedelta(hours=24)
                )
            ),
            late_cancelled=Count(
                "id",
                filter=Q(
                    status="cancelled",
                    cancelled_at__gt=F("scheduled_time") - timedelta(hours=24)
                )
            ),
        )

        positive_points = (
            stats["completed"] *
            config.completed_weight
        )

        negative_points = (
            stats["early_cancelled"] *
            config.cancelled_early_weight
            +
            stats["late_cancelled"] *
            config.cancelled_late_weight
            +
            stats["no_show"] *
            config.no_show_weight
        )

        if positive_points == 0 and negative_points == 0:
            return 100
        
        return (
            positive_points /
            (positive_points + negative_points)
        ) * 100

    def __str__(self):
        return f"{self.reliability}"
    
    def save(self, *args, **kwargs):
        # If linked to a User, sync names from User if not manually specified
        if self.user:
            if not self.first_name:
                self.first_name = self.user.first_name
            if not self.last_name:
                self.last_name = self.user.last_name
                
        super().save(*args, **kwargs)

