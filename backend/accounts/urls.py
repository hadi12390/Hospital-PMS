from django.urls import path
from .views import StaffCreateUserView

urlpatterns = [
    path('create-user/', StaffCreateUserView.as_view(), name='staff-create-user'),
]