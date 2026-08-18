from django.urls import path
from .views import PatientProfileEditView, PatientDashboard, patientPublicView

urlpatterns = [
    path('profile/', PatientProfileEditView.as_view()),
    path('dashboard/', PatientDashboard.as_view(), name="patient-dashboard"),
]