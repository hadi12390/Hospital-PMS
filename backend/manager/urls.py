from django.urls import path
from .views import AddDoctor, ManagerDashboard

urlpatterns = [
    path('add-doctor/', AddDoctor.as_view()),
    path('dashboard/', ManagerDashboard.as_view(), name="manager-dashboard"),
]