from django.urls import path, include
from .views import DoctorDashboard, DoctorProfileEditView

urlpatterns = [
    path('dashboard/', DoctorDashboard.as_view()),
    path('profile/', DoctorProfileEditView.as_view(), name="doctor=profile")
]