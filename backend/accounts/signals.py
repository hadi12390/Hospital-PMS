from allauth.account.signals import email_confirmed
from django.dispatch import receiver
from logs.models import ActivityLog
from allauth.account.models import EmailAddress

@receiver(email_confirmed) 
def create_email_verified_log(request, email_address, **kwargs): # it will only run if the email is verifid
    ActivityLog.objects.create(
        user=email_address.user,
        action=ActivityLog.Action.EMAIL_VERIFIED,
        description=f"{email_address.email} verified their email."
    )

@receiver(email_confirmed)
def update_primary_email(request, email_address, **kwargs):
    user = email_address.user

    old_email = user.email
    new_email = email_address.email

    email_address.set_as_primary()
    
    EmailAddress.objects.filter(
        user=user
    ).exclude(
        pk=email_address.pk
    ).delete()

    if old_email != new_email:
        user.email = new_email
        user.save(update_fields=["email"])
        ActivityLog.objects.create(
            user=user,
            action=ActivityLog.Action.EMAIL_CHANGED,
            description=f"Email changed from {old_email} to {new_email}."
        )