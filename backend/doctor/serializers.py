from rest_framework import serializers
from .models import Doctor

class DoctorSerializer(serializers.ModelSerializer):

    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    
    class Meta:
        model = Doctor
        fields = [
            "first_name",
            "last_name",
            "specialty",
            "consultation_duration",
            "follow_up_duration",
            "checkup_duration",
            "phone_number",
            "start_time",
            "end_time",
            "created_at",
        ]
        
        read_only_fields = [
            "specialty",
            "start_time",
            "end_time",
            "created_at",
        ]
    