from django.db import models
from django.conf import settings

class Manager(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
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

