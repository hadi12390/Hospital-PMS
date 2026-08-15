from django.urls import path
from .views import ProfileEditView, PatientDashboard

urlpatterns = [
    path('profile/', ProfileEditView.as_view()),
    path('dashboard/', PatientDashboard.as_view())
]