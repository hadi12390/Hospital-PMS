from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from django_tenants.utils import schema_context, get_tenant_model
from datetime import timedelta


User = get_user_model()


class Command(BaseCommand):
    help = "Expire unverified users after 48 hours and delete expired users after 14 days"

    def handle(self, *args, **options):
        TenantModel = get_tenant_model()
        now = timezone.now()
        total_deleted = 0
        total_expired = 0

        for tenant in TenantModel.objects.exclude(schema_name="public"):
            with schema_context(tenant.schema_name):
                # Delete users who have been expired for 14 days
                delete_users = User.objects.filter(
                    status=User.Status.EXPIRED,
                    expired_at__lt=now - timedelta(days=14),
                    emailaddress__verified=False,
                )
                delete_count = delete_users.count()
                delete_users.delete()
                total_deleted += delete_count

                # Expire users who registered 48 hours ago and never verified
                expired_users = User.objects.filter(
                    status=User.Status.ACTIVE,
                    date_joined__lt=now - timedelta(hours=48),
                    emailaddress__verified=False,
                )
                expired_count = expired_users.count()
                expired_users.update(
                    status=User.Status.EXPIRED,
                    expired_at=now,
                )
                total_expired += expired_count

        self.stdout.write(
            self.style.SUCCESS(f"Deleted {total_deleted} expired user(s) across all tenants.")
        )
        self.stdout.write(
            self.style.SUCCESS(f"Expired {total_expired} unverified user(s) across all tenants.")
        )