from django.urls import path
from .views import AddDoctor

urlpatterns = [
    path('add-doctor/', AddDoctor.as_view()),
]