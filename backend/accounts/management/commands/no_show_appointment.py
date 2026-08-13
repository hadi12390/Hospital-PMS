from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from django_tenants.utils import schema_context, get_tenant_model
from appointments.models import Appointment


class Command(BaseCommand):
    help = "Mark confirmed appointments older than 24 hours as NO_SHOW."

    def handle(self, *args, **options):
        TenantModel = get_tenant_model()
        cutoff_time = timezone.now() - timedelta(hours=24)
        total_updated = 0

        for tenant in TenantModel.objects.exclude(schema_name="public"):
            with schema_context(tenant.schema_name):
                updated_count = Appointment.objects.filter(
                    status=Appointment.Status.CONFIRMED,
                    scheduled_time__lt=cutoff_time,
                ).update(status=Appointment.Status.NO_SHOW)

                total_updated += updated_count

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully set {total_updated} appointment(s) to 'NO_SHOW' status across all tenants."
            )
        )