from django.urls import path, include
from .views import DoctorTotal

urlpatterns = [
    path('total/', DoctorTotal.as_view()),
]