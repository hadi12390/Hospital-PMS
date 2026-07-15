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
    start_time = models.TimeField()
    end_time = models.TimeField()

    def __str__(self):
        return f"Dr. {self.user.get_full_name() or self.user.username}"



class Patient(models.Model):  
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, # if the user got deleted this field will be Null
        # making this field optinal in case he's just a visitor
        null = True,
        blank = True,
        limit_choices_to={'role': 'patient'}, 
        related_name='patient'  
    )
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    birth_date = models.DateField()
    
    # Renamed the inner class to Gender to avoid confusing it with 'User.Role'
    class Gender(models.TextChoices):
        FEMALE = 'female', 'Female'
        MALE = 'male', 'Male'
        UNKNOWN = 'unknown', 'Unknown' 
        
    gender = models.CharField(max_length=10, choices=Gender.choices, default=Gender.UNKNOWN)
    phone_number = models.CharField(max_length=15, blank=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"



class Appointment(models.Model):  
    doctor = models.ForeignKey(Doctor, on_delete=models.SET_NULL, null=True, related_name='appointments')
    patient = models.ForeignKey(Patient, on_delete=models.SET_NULL, null=True, related_name='appointments')
    
    # This single field handles day AND hour/minute perfectly
    scheduled_time = models.DateTimeField() 
    
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        CONFIRMED = 'confirmed', 'Confirmed'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'
    
    reason_for_visit = models.CharField(max_length=255, blank=True, help_text="The patient's primary symptoms or reason for booking.")
    # Bumped max_length up to 20 to safely hold 'confirmed' and 'cancelled'
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    notes = models.TextField(max_length=1000, blank=True) # Added blank=True so notes are optional

    def __str__(self):
        return f"Appointment: {self.patient} with {self.doctor} on {self.scheduled_time}"



class MedicalHistory(models.Model):
    patient = models.ForeignKey(
        Patient, 
        on_delete=models.CASCADE, 
        related_name='medical_histories'
    )
    # The sickness, disease, or condition (e.g., "Type 2 Diabetes", "Asthma")
    condition_name = models.CharField(max_length=255)
    
    # Standard medical systems use ICD codes (International Classification of Diseases)
    icd_code = models.CharField(max_length=15, blank=True, help_text="e.g., E11.9")
    
    # When did this sickness start?
    diagnosed_date = models.DateField(null=True, blank=True)
    
    # Is it ongoing, or resolved?
    is_current = models.BooleanField(default=True)
    resolved_date = models.DateField(null=True, blank=True)
    
    # Additional doctor's notes regarding this specific condition
    notes = models.TextField(blank=True)
    
    # Tracking record creation
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Medical Histories"
        ordering = ['-diagnosed_date', '-created_at']

    def __str__(self):
        status = "Active" if self.is_current else "Resolved"
        return f"{self.patient} - {self.condition_name} ({status})"


class MedicalDocument(models.Model):
    # Every document MUST belong to a patient
    patient = models.ForeignKey(
        Patient, 
        on_delete=models.CASCADE, 
        related_name='documents'
    )
    
    # OPTIONAL: Link this document to a specific chronic medical condition
    medical_history = models.ForeignKey(
        MedicalHistory,
        on_delete=models.SET_NULL, # If the history record is deleted, keep the document
        null=True,
        blank=True,
        related_name='documents'
    )
    
    # OPTIONAL: Link this document to a specific appointment (e.g., today's X-ray)
    appointment = models.ForeignKey(
        Appointment,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='documents'
    )

    title = models.CharField(max_length=255, help_text="e.g., Left Knee X-Ray, Blood Panel")
    file = models.FileField(upload_to='patient_docs/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} for {self.patient}"


class Manager(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,  # Typo fixed here!
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'manager'},
        related_name='manager'
    )
    phone_number = models.CharField(max_length=15, blank=True)
    
    # What is their specific administrative title?
    title = models.CharField(
        max_length=100, 
        blank=True, 
        help_text="e.g., Head of Operations, Billing Supervisor"
    )
    
    # Keeping track of their employment
    hire_date = models.DateField(null=True, blank=True)
    
    # If your app scales to multiple departments or locations
    department = models.CharField(
        max_length=100, 
        blank=True,
        help_text="e.g., Front Desk, Billing, Human Resources"
    )

    class Meta:
        verbose_name = "Manager"
        verbose_name_plural = "Managers"

    def __str__(self):
        return f"Manager: {self.user.get_full_name() or self.user.username} ({self.title or 'Admin'})"