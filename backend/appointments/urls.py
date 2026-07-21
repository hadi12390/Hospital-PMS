from django.urls import path, include
from .views import (
    ManagerListCreateAppointment, 
    DoctorListCreateAppointment, 
    PatientListCreateAppointment,
    DoctorAppointmentDetailView,
)

urlpatterns = [
    path('manager/', ManagerListCreateAppointment.as_view()),
    path('doctor/', DoctorListCreateAppointment.as_view()),
    path('patient/', PatientListCreateAppointment.as_view()),
    path('doctor/<int:pk>/', DoctorAppointmentDetailView.as_view())
]