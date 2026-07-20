from django.urls import path
from .views import AddDoctor, AddManager

urlpatterns = [
    path('add-doctor/', AddDoctor.as_view()),
    path('add-manager/', AddManager.as_view()),
]