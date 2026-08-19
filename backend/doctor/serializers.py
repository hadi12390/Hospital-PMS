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

class ViewAllDoctorsSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    public_id = serializers.UUIDField(source='user.public_id', read_only=True)
    profile_picture = serializers.SerializerMethodField()

    class Meta:
        model = Doctor
        fields = [
            "public_id",
            "first_name",
            "last_name",
            "profile_picture",
            "specialty",
            "phone_number",
            "start_time",
            "end_time",
            "created_at",
        ]
        read_only_fields = [
            "public_id",
            "first_name",
            "last_name",
            "profile_picture",
            "specialty",
            "phone_number",
            "start_time",
            "end_time",
            "created_at",
        ]

    def get_profile_picture(self, obj):
        if not obj.user.profile_picture:
            return None
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(obj.user.profile_picture.url)
        return obj.user.profile_picture.url