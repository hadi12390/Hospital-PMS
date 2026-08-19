from django.core.validators import MinValueValidator
from django.db import models


class ClinicConfiguration(models.Model):
    completed_weight = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=1.00,
        validators=[MinValueValidator(0)]
    )

    cancelled_early_weight = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=0.25,
        validators=[MinValueValidator(0)]
    )

    cancelled_late_weight = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=0.75,
        validators=[MinValueValidator(0)]
    )

    no_show_weight = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=2.00,
        validators=[MinValueValidator(0)]
    )


    reliability_enabled = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @classmethod
    def get_solo(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
    

class ReliabilityPolicy(models.Model):
    min_reliability = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(0)])

    max_pending_appointments = models.PositiveIntegerField()
    max_advance_booking_days = models.PositiveIntegerField()

    block_online_booking = models.BooleanField(default=False)

    class Meta:
        ordering = ["min_reliability"]

    def __str__(self):
        return f"{self.min_reliability}"