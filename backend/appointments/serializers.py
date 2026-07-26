from rest_framework import serializers
from .models import Appointment

class ManagerAppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = "__all__"

class DoctorAppointmentSerializer(serializers.ModelSerializer):

    patient_no_show_count = serializers.IntegerField(
        source="patient.no_show_count", 
        read_only=True
    )

    class Meta:
        model = Appointment
        fields = [
            "patient",
            "scheduled_time",
            "reason_for_visit",
            "notes",
            "status",
            "patient_no_show_count",
            "end_time",
            "appointment_type",
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
        fields = ['duration_minutes', 'status', 'notes']
        
    def validate_status(self, value):
        if self.instance.status == Appointment.Status.COMPLETED:
            raise serializers.ValidationError("Cannot change the status of a completed appointment.")
        return value