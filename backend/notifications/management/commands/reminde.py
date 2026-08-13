from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from django_tenants.utils import schema_context, get_tenant_model
from appointments.models import Appointment
from notifications.models import Notification


class Command(BaseCommand):
    help = "Send reminder notifications for appointments happening in ~24 hours."

    def handle(self, *args, **options):
        TenantModel = get_tenant_model()
        now = timezone.now()
        window_start = now + timedelta(hours=23, minutes=45)
        window_end = now + timedelta(hours=24, minutes=15)

        total_sent = 0

        for tenant in TenantModel.objects.exclude(schema_name="public"):
            with schema_context(tenant.schema_name):
                appointments = Appointment.objects.filter(
                    status=Appointment.Status.CONFIRMED,
                    scheduled_time__range=(window_start, window_end),
                    reminder_sent=False,
                ).select_related("patient__user", "doctor__user")

                for appointment in appointments:
                    Notification.create_notification(
                        user=appointment.patient.user,
                        notification_type=Notification.Type.REMINDER,
                        title="Appointment reminder",
                        message=f"Reminder: you have an appointment tomorrow at {appointment.scheduled_time}.",
                        appointment=appointment,
                    )
                    appointment.reminder_sent = True
                    appointment.save(update_fields=["reminder_sent"])
                    total_sent += 1

        self.stdout.write(
            self.style.SUCCESS(f"Sent {total_sent} reminder notification(s) across all tenants.")
        )