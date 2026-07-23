from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from appointment.models import Appointment


class Command(BaseCommand):
    help = "Mark confirmed appointments older than 24 hours as NO_SHOW."

    def handle(self, *args, **options):
        cutoff_time = timezone.now() - timedelta(hours=24)

        # .update() returns the exact count of rows modified in a single query
        updated_count = Appointment.objects.filter(
            status=Appointment.Status.CONFIRMED,
            scheduled_time__lt=cutoff_time,
        ).update(status=Appointment.Status.NO_SHOW)

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully set {updated_count} appointment(s) to 'NO_SHOW' status."
            )
        )