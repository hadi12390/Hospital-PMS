from rest_framework import serializers
from .models import Appointment
from django.db.models import Q

class BaseAppointmentSerializer(serializers.ModelSerializer):
    def has_conflict(self, doctor, patient, scheduled_time, appointment_type=None,
                    duration_minutes=None, exclude_id=None):
        temp = Appointment(
            patient=patient,
            doctor=doctor,
            scheduled_time=scheduled_time,
            appointment_type=appointment_type or Appointment.AppointmentType.CONSULTATION,
            duration_minutes=duration_minutes,
        )
        new_end = temp.end_time

        appointments = Appointment.objects.filter(
            Q(doctor=doctor) | Q(patient=patient),
            status__in=[
                Appointment.Status.PENDING,
                Appointment.Status.CONFIRMED,
            ],
        )
        if exclude_id:
            appointments = appointments.exclude(id=exclude_id)

        for appointment in appointments:
            if scheduled_time < appointment.end_time and new_end > appointment.scheduled_time:
                return True

        return False


class ManagerAppointmentSerializer(BaseAppointmentSerializer):
    end_time = serializers.ReadOnlyField()

    class Meta:
        model = Appointment
        fields = "__all__"

    def validate(self, attrs):
        patient = attrs.get("patient", getattr(self.instance, "patient", None))
        doctor = attrs.get("doctor", getattr(self.instance, "doctor", None))
        scheduled_time = attrs.get("scheduled_time", getattr(self.instance, "scheduled_time", None))
        appointment_type = attrs.get("appointment_type", getattr(self.instance, "appointment_type", None))
        duration_minutes = attrs.get("duration_minutes", getattr(self.instance, "duration_minutes", None))

        if self.has_conflict(
            doctor=doctor,
            patient=patient,
            scheduled_time=scheduled_time,
            appointment_type=appointment_type,
            duration_minutes=duration_minutes,
            exclude_id=self.instance.id if self.instance else None,
        ):
            raise serializers.ValidationError("This time slot conflicts with another appointment for this doctor.")

        return attrs


class DoctorAppointmentSerializer(BaseAppointmentSerializer):
    patient_no_show_count = serializers.IntegerField(
        source="patient.no_show_count",
        read_only=True
    )
    end_time = serializers.ReadOnlyField()

    class Meta:
        model = Appointment
        fields = [
            "id",
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

    def validate(self, attrs):
        request = self.context["request"]

        attrs["doctor"] = request.user.doctor
        attrs["status"] = Appointment.Status.CONFIRMED

        if self.has_conflict(
            doctor=attrs["doctor"],
            scheduled_time=attrs["scheduled_time"],
            patient=attrs.get("patient", getattr(self.instance, "patient", None)),
            appointment_type=attrs.get("appointment_type", getattr(self.instance, "appointment_type", None)),
            duration_minutes=attrs.get("duration_minutes", getattr(self.instance, "duration_minutes", None)),
            exclude_id=self.instance.id if self.instance else None,
        ):
            raise serializers.ValidationError("This time slot conflicts with another appointment.")

        return super().validate(attrs)


class PatientAppointmentSerializer(BaseAppointmentSerializer):
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

    def validate(self, attrs):
        request = self.context["request"]
        patient = request.user.patient

        if self.has_conflict(
            doctor = attrs.get("doctor", getattr(self.instance, "doctor", None)),
            patient=patient,
            scheduled_time=attrs["scheduled_time"],
            appointment_type=attrs.get("appointment_type", getattr(self.instance, "appointment_type", None)),
            duration_minutes=attrs.get("duration_minutes", getattr(self.instance, "duration_minutes", None)),
            exclude_id=self.instance.id if self.instance else None,
        ):
            raise serializers.ValidationError("This time slot conflicts with another appointment.")

        return attrs

    def create(self, validated_data):
        request = self.context["request"]
        validated_data["patient"] = request.user.patient
        validated_data["status"] = "pending"

        return super().create(validated_data)


class DoctorAppointmentUpdateSerializer(BaseAppointmentSerializer):
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

    def validate(self, attrs):
        duration_minutes = attrs.get("duration_minutes", self.instance.duration_minutes)
        appointment_type = attrs.get("appointment_type", self.instance.appointment_type)

        if self.has_conflict(
            patient=self.instance.patient,
            doctor=self.instance.doctor,
            scheduled_time=self.instance.scheduled_time,
            appointment_type=appointment_type,
            duration_minutes=duration_minutes,
            exclude_id=self.instance.id,
        ):
            raise serializers.ValidationError("This time slot conflicts with another appointment.")

        return attrs


class DoctorPendingAppointmentSerializer(BaseAppointmentSerializer):

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