from django.urls import path, include
from .views import (
    ManagerListCreateAppointment, 
    DoctorListCreateAppointment, 
    PatientListCreateAppointment,
    DoctorAppointmentDetailView,
    PendingAppointmentsView,
)

urlpatterns = [
    path('manager/', ManagerListCreateAppointment.as_view()),
    path('doctor/', DoctorListCreateAppointment.as_view()),
    path('', PatientListCreateAppointment.as_view()),
    path('doctor/<uuid:public_id>/', DoctorAppointmentDetailView.as_view()),
    path('pending/', PendingAppointmentsView.as_view()),
]