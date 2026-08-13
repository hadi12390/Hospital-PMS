from django.urls import path, include
from .views import AddPatient

urlpatterns = [
    path('add-patient/', AddPatient.as_view()),
    path('doctor/', include('doctor.urls')),
    path('patient/', include('patient.urls')),
    path('manager/', include('manager.urls')),
    path('appointment/', include('appointments.urls')),
    path('notifications/', include('notifications.urls')),
]