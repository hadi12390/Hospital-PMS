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
        fields = [
            "patient",
            "scheduled_time",
            "duration_minutes",
            "reason_for_visit",
            "appointment_type",
            "created_at",
            "status",
            "notes",
        ]
        read_only_fields = [
            "patient", 
            "scheduled_time",
            "reason_for_visit",
            "created_at",
        ]
        
    def validate_status(self, value):
        if self.instance.status == Appointment.Status.COMPLETED:
            raise serializers.ValidationError("Cannot change the status of a completed appointment.")
        return value

class DoctorPendingAppointmentSerializer(serializers.ModelSerializer):

    patient_name = serializers.SerializerMethodField()

    def get_patient_name(self, obj):
        if obj.patient.user:
            return obj.patient.user.get_full_name()
        return obj.patient.name

    class Meta:
        model = Appointment
        fields = [
            "id",
            "patient_name",
            "scheduled_time",
            "reason_for_visit",
            "appointment_type",
            "created_at",
        ]