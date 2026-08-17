from django.urls import path
from .views import (
    AddDoctor, 
    ManagerDashboard, 
    ManageDoctors, 
    ManageAppointments,
    ManagePatients,
    DoctorOverView,
)

urlpatterns = [
    path('add-doctor/', AddDoctor.as_view()),
    path('dashboard/', ManagerDashboard.as_view(), name="manager-dashboard"),
    path('manage-doctors/', ManageDoctors.as_view(), name="manage-doctors"),
    path('manage-appointments', ManageAppointments.as_view(), name="manage-appointments"),
    path('manage-patients/', ManagePatients.as_view(), name="manage-patients"),
    path('manage-doctors/<uuid:public_id>/', DoctorOverView.as_view(), name="doctor-overview")
]