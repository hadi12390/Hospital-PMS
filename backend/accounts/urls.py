from django.urls import path
from .views import StaffCreateUserView, ChangeEmailView, PersonalInformationEditView

urlpatterns = [
    path('create-user/', StaffCreateUserView.as_view(), name='staff-create-user'),
    path('change-email', ChangeEmailView.as_view(), name="change-email"),
    path('personal-informations/', PersonalInformationEditView.as_view(), name="personal-information")
]