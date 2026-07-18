from allauth.account.forms import ResetPasswordForm as AllAuthPasswordResetForm
from allauth.account.forms import default_token_generator
from allauth.account.adapter import get_adapter
from allauth.account.utils import user_pk_to_url_str
from django.conf import settings


class CustomAllAuthPasswordResetForm(AllAuthPasswordResetForm):
    def save(self, request, **kwargs):
        email = self.cleaned_data["email"]
        token_generator = kwargs.get("token_generator", default_token_generator)

        for user in self.users:
            temp_key = token_generator.make_token(user)
            uid = user_pk_to_url_str(user)
            url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{temp_key}/"

            context = {
                "user": user,
                "password_reset_url": url,
                "request": request,
            }
            get_adapter(request).send_mail(
                "account/email/password_reset_key", email, context
            )

        return email