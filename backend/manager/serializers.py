from rest_framework import serializers
from doctor.models import Doctor
from django.utils import timezone

class AddDoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = [
            "user",
            "specialty",
            "consultation_duration",
            "follow_up_duration",
            "checkup_duration",
            "phone_number",
            "start_time",
            "end_time",
            "created_at",
        ]

        read_only_fields = ["created_at"]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["user"] = {
            "public_id": instance.user.public_id,
            "name": instance.user.get_full_name()
        }
        return data

class DoctorOverviewSerializer(serializers.ModelSerializer):
    name = serializers.CharField(
        source="user.get_full_name",
        read_only=True,
    )
    email = serializers.EmailField(
        source="user.email",
        read_only=True,
    )
    status = serializers.SerializerMethodField()

    class Meta:
        model = Doctor
        fields = [
            "name",
            "email",
            "specialty",
            "phone_number",
            "start_time",
            "end_time",
            "consultation_duration",
            "follow_up_duration",
            "checkup_duration",
            "status",
        ]

    def get_status(self, obj):
        now_time = timezone.localtime().time()

        if obj.start_time <= obj.end_time:
            is_active = obj.start_time <= now_time <= obj.end_time
        else:
            is_active = (
                now_time >= obj.start_time
                or now_time <= obj.end_time
            )

        return "active" if is_active else "inactive"