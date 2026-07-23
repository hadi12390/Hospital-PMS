from django.urls import path, include
from .views import DoctorDashboard

urlpatterns = [
    path('dashboard/', DoctorDashboard.as_view()),
]