from django.urls import path
from .views import DoctorDashboard, DoctorProfileEditView, ViewAllDoctors
from patient.views import patientPublicView

urlpatterns = [
    path('dashboard/', DoctorDashboard.as_view()),
    path('profile/', DoctorProfileEditView.as_view(), name="doctor=profile"),
    path('patient/<uuid:public_id>/', patientPublicView.as_view(), name="patient-overview"),
    path('', ViewAllDoctors.as_view(), name="view-all-doctors")
]