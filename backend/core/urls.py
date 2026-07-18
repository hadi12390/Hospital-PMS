from django.urls import path
from .views import AddDoctor, AddManager, AddPatient
urlpatterns = [
    path('add-doctor/', AddDoctor.as_view()),
    path('add-manager/', AddManager.as_view()),
    path('add-patient/', AddPatient.as_view()),
]