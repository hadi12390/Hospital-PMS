from django.urls import path
from .views import (
    ManagerListCreateAppointment, 
    DoctorListCreateAppointment, 
    PatientListCreateAppointment,
    DoctorAppointmentDetailView,
    PendingAppointmentsView,
    AvailableTimesView,
)

urlpatterns = [
    path('manager/', ManagerListCreateAppointment.as_view()),
    path('doctor/', DoctorListCreateAppointment.as_view()),
    path('', PatientListCreateAppointment.as_view()),
    path('doctor/<uuid:public_id>/', DoctorAppointmentDetailView.as_view()),
    path('doctor/pending/', PendingAppointmentsView.as_view()),
    path('available-times/', AvailableTimesView.as_view()),
]