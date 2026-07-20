from django.db import models
from django.conf import settings
from patient.models import Patient
from appointments.models import Appointment

class PatientCondition(models.Model):
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='conditions'
    )

    condition_name = models.CharField(max_length=255)

    icd_code = models.CharField(
        max_length=15,
        blank=True,
        help_text="e.g., E11.9"
    )

    diagnosed_date = models.DateField(
        null=True,
        blank=True
    )

    is_current = models.BooleanField(default=True)

    resolved_date = models.DateField(
        null=True,
        blank=True
    )

    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-diagnosed_date', '-created_at']

    def __str__(self):
        return f"{self.patient} - {self.condition_name}"


class MedicalDocument(models.Model):

    class DocumentType(models.TextChoices):
        XRAY = "xray", "X-Ray"
        MRI = "mri", "MRI"
        CT = "ct", "CT Scan"
        LAB = "lab", "Laboratory Result"
        PRESCRIPTION = "prescription", "Prescription"
        REFERRAL = "referral", "Referral"
        OTHER = "other", "Other"

    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='documents'
    )

    patient_condition = models.ForeignKey(
        PatientCondition,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='documents'
    )

    appointment = models.ForeignKey(
        Appointment,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='documents'
    )

    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="uploaded_documents"
    )

    document_type = models.CharField(
        max_length=20,
        choices=DocumentType.choices,
        default=DocumentType.OTHER
    )

    title = models.CharField(max_length=255)

    file = models.FileField(
        upload_to='patient_docs/'
    )

    uploaded_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.title} for {self.patient}"
