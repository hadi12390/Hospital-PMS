from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    appointment_public_id = serializers.UUIDField(
        source="appointment.public_id", read_only=True, allow_null=True
    )

    class Meta:
        model = Notification
        fields = [
            "public_id",
            "notification_type",
            "title",
            "message",
            "is_read",
            "created_at",
            "appointment_public_id",
        ]

class NotificationUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["is_read"]
