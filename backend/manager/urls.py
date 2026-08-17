from django.urls import path
from .views import AddDoctor, ManagerDashboard, ManageDoctors, ManageAppointments

urlpatterns = [
    path('add-doctor/', AddDoctor.as_view()),
    path('dashboard/', ManagerDashboard.as_view(), name="manager-dashboard"),
    path('manage-doctors/', ManageDoctors.as_view(), name="manage-doctors"),
    path('manage-appointments', ManageAppointments.as_view(), name="manage-appointments")
]