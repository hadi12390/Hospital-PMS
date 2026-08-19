from django.urls import path
from .views import (
    DoctorDashboard, 
    DoctorProfileEditView, 
    ViewAllDoctors, 
    DoctorPatients, 
    DoctorAppointments, 
    TodaySchedule
)
from patient.views import patientPublicView

urlpatterns = [
    path('dashboard/', DoctorDashboard.as_view()),
    path('profile/', DoctorProfileEditView.as_view(), name="doctor=profile"),
    path('patients/<uuid:public_id>/', patientPublicView.as_view(), name="patient-overview"),
    path('', ViewAllDoctors.as_view(), name="view-all-doctors"),
    path('patients/', DoctorPatients.as_view(), name="view-all-patients"),
    path('appointments/', DoctorAppointments.as_view(), name="appointments"),
    path('today-schedule', TodaySchedule.as_view(), name="today-schedule")
]