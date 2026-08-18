from django.urls import path
from .views import StaffCreateUserView, ChangeEmailView

urlpatterns = [
    path('create-user/', StaffCreateUserView.as_view(), name='staff-create-user'),
    path('change-email', ChangeEmailView.as_view(), name="change-email")
]