from rest_framework import serializers
from .models import Appointment

class ManagerAppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = [
            "patient",
            "doctor",
            "scheduled_time",
            "reason_for_visit",
            "status",
            "notes",
        ]

class DoctorAppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = [
            "patient",
            "scheduled_time",
            "reason_for_visit",
            "notes",
            "status",
        ]
        
        read_only_fields = ["status"]
    
    def create(self, validated_data):
        request = self.context["request"]
        validated_data["doctor"] = request.user.doctor
        validated_data["status"] = "confirmed"
        
        return super().create(validated_data)

class PatientAppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = [
            "doctor",
            "scheduled_time",
            "reason_for_visit",
            "notes",
            "status",
        ]

        read_only_fields = ["status"]

    def create(self, validated_data):
        request = self.context["request"]
        validated_data["patient"] = request.user.patient
        validated_data["status"] = "pending"

        return super().create(validated_data)


class DoctorAppointmentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ['status', 'notes']
        
    def validate_status(self, value):
        if self.instance.status == Appointment.Status.COMPLETED:
            raise serializers.ValidationError("Cannot change the status of a completed appointment.")
        return value