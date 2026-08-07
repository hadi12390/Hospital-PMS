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

    max_pending_appointments = models.PositiveSmallIntegerField(default=3)
    reliability_enabled = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @classmethod
    def get_solo(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
    