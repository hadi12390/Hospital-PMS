from rest_framework import serializers
from doctor.models import Doctor

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