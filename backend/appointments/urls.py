from django.urls import path
from .views import (
    ManagerListCreateAppointment, 
    DoctorListCreateAppointment, 
    PatientListCreateAppointment,
    DoctorAppointmentDetailView,
    PendingAppointmentsView,
    AvailableTimesView,
    AppointmentCancelView,
)

urlpatterns = [
    path('manager/', ManagerListCreateAppointment.as_view()),
    path('doctor/', DoctorListCreateAppointment.as_view()),
    path('', PatientListCreateAppointment.as_view()),
    path('doctor/<uuid:public_id>/', DoctorAppointmentDetailView.as_view()),
    path('doctor/pending/', PendingAppointmentsView.as_view()),
    path('available-times/', AvailableTimesView.as_view()),
    path('<uuid:public_id>/cancel/', AppointmentCancelView.as_view(), name="appointment-cancel")
]