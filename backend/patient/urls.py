from django.urls import path
from .views import ProfileEditView

urlpatterns = [
    path('profile/', ProfileEditView.as_view())
]