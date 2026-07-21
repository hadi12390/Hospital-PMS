from django.urls import path, include
from .views import ManagerListCreateAppointment, DoctorListCreateAppointment, PatientListCreateAppointment

urlpatterns = [
    path('manager/', ManagerListCreateAppointment.as_view()),
    path('doctor/', DoctorListCreateAppointment.as_view()),
    path('patient/', PatientListCreateAppointment.as_view()),
]