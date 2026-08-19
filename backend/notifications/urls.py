from django.urls import path
from .views import NotificationListView, NotificationDetailView

urlpatterns = [
    path("", NotificationListView.as_view()),
    path("<uuid:public_id>/", NotificationDetailView.as_view()),
]