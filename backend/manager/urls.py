from django.urls import path
from .views import (
    AddDoctor, 
    ManagerDashboard, 
    ManageDoctors, 
    ManageAppointments,
    ManagePatients,
    DoctorOverView,
)
from appointments.views import ManagerAppointmentUpdateView
from patient.views import patientPublicView

urlpatterns = [
    path('add-doctor/', AddDoctor.as_view()),
    path('dashboard/', ManagerDashboard.as_view(), name="manager-dashboard"),
    path('manage-doctors/', ManageDoctors.as_view(), name="manage-doctors"),
    path('manage-appointments/', ManageAppointments.as_view(), name="manage-appointments"),
    path('manage-patients/', ManagePatients.as_view(), name="manage-patients"),
    path('manage-appointments/<uuid:public_id>/', ManagerAppointmentUpdateView.as_view(), name="appointment-overview"),
    path('manage-doctors/<uuid:public_id>/', DoctorOverView.as_view(), name="doctor-overview"),
    path('manage-patients/<uuid:public_id>/', patientPublicView.as_view(), name="patient-overview"),
]