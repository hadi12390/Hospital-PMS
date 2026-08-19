from rest_framework.generics import ListAPIView, RetrieveUpdateAPIView
from .serializers import NotificationSerializer, NotificationUpdateSerializer
from .models import Notification
from accounts.permissions import IsDoctor, IsPatient, IsManager

class NotificationListView(ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsDoctor | IsPatient | IsManager]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user, is_read=False)

class NotificationDetailView(RetrieveUpdateAPIView):
    serializer_class = NotificationUpdateSerializer
    permission_classes = [IsDoctor | IsPatient | IsManager]
    lookup_field = "public_id"
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
