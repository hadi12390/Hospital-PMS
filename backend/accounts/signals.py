from allauth.account.signals import email_confirmed
from django.dispatch import receiver
from logs.models import ActivityLog

@receiver(email_confirmed) 
def create_email_verified_log(request, email_address, **kwargs): # it will only run if the email is verifid
    ActivityLog.objects.create(
        user=email_address.user,
        action=ActivityLog.Action.EMAIL_VERIFIED,
        description=f"{email_address.email} verified their email."
    )
