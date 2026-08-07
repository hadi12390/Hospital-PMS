from rest_framework import serializers
from django.db.models import Q

from .models import Appointment
from doctor.models import Doctor
from patient.models import Patient


class BaseAppointmentSerializer(serializers.ModelSerializer):

    def has_conflict(
        self,
        doctor,
        patient,
        scheduled_time,
        appointment_type=None,
        duration_minutes=None,
        exclude_id=None,
    ):
        temp = Appointment(
            patient=patient,
            doctor=doctor,
            scheduled_time=scheduled_time,
            appointment_type=(
                appointment_type
                or Appointment.AppointmentType.CONSULTATION
            ),
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
            if (
                scheduled_time < appointment.end_time
                and new_end > appointment.scheduled_time
            ):
                return True

        return False
    
    
    def suitable_for_dr(
        self,
        doctor,
        patient,
        scheduled_time,
        appointment_type=None,
        duration_minutes=None,
    ):
        temp = Appointment(
            patient=patient,
            doctor=doctor,
            scheduled_time=scheduled_time,
            appointment_type=(
                appointment_type
                or Appointment.AppointmentType.CONSULTATION
            ),
            duration_minutes=duration_minutes,
        )

        start = scheduled_time.time()
        end = temp.end_time.time()

        return (
            start >= doctor.start_time
            and start < doctor.end_time
            and end <= doctor.end_time
        )

    
    def get_full_name(self, person):
        if person is None:
            return None

        if getattr(person, "user", None):
            return person.user.get_full_name()

        return getattr(person, "name", None)


    def get_person_repr(self, person):
        if person is None:
            return None

        return {
            "public_id": (
                person.user.public_id
                if getattr(person, "user", None)
                else None
            ),
            "name": self.get_full_name(person),
        }


# =========================
# Manager Create Serializer
# =========================

class ManagerAppointmentCreateSerializer(BaseAppointmentSerializer):

    doctor = serializers.SlugRelatedField(
        slug_field="user__public_id",
        queryset=Doctor.objects.all(),
        write_only=True,
    )

    patient = serializers.SlugRelatedField(
        slug_field="user__public_id",
        queryset=Patient.objects.all(),
        write_only=True,
    )


    class Meta:
        model = Appointment
        fields = [
            "doctor",
            "patient",
            "scheduled_time",
            "reason_for_visit",
            "notes",
            "status",
            "appointment_type",
            "duration_minutes",
        ]


    def validate(self, attrs):

        if self.has_conflict(
            doctor=attrs["doctor"],
            patient=attrs["patient"],
            scheduled_time=attrs["scheduled_time"],
            appointment_type=attrs.get("appointment_type"),
            duration_minutes=attrs.get("duration_minutes"),
            exclude_id=(
                self.instance.id
                if self.instance
                else None
            ),
        ):
            raise serializers.ValidationError(
                "This time slot conflicts with another appointment."
            )
        
        if not self.suitable_for_dr(
            doctor=attrs["doctor"],
            patient=attrs["patient"],
            scheduled_time=attrs["scheduled_time"],
            appointment_type=attrs.get("appointment_type"),
            duration_minutes=attrs.get("duration_minutes"),
        ):
            raise serializers.ValidationError({
                "scheduled_time": "This appointment may fall outside the doctor's working hours."
            })

        return attrs



# =========================
# Manager Read Serializer
# =========================

class ManagerAppointmentSerializer(BaseAppointmentSerializer):

    end_time = serializers.ReadOnlyField()

    doctor = serializers.SerializerMethodField()
    patient = serializers.SerializerMethodField()


    class Meta:
        model = Appointment

        fields = [
            "public_id",
            "doctor",
            "patient",
            "scheduled_time",
            "reason_for_visit",
            "notes",
            "status",
            "appointment_type",
            "created_at",
            "end_time",
        ]


    def get_doctor(self, obj):
        return self.get_person_repr(obj.doctor)


    def get_patient(self, obj):
        return self.get_person_repr(obj.patient)



# =========================
# Doctor Create Appointment
# =========================

class DoctorAppointmentSerializer(BaseAppointmentSerializer):

    patient = serializers.SlugRelatedField(
        slug_field="user__public_id",
        queryset=Patient.objects.all(),
    )

    patient_no_show_count = serializers.IntegerField(
        source="patient.no_show_count",
        read_only=True,
    )

    end_time = serializers.ReadOnlyField()


    class Meta:
        model = Appointment

        fields = [
            "public_id",
            "patient",
            "scheduled_time",
            "reason_for_visit",
            "notes",
            "status",
            "patient_no_show_count",
            "end_time",
            "appointment_type",
            "duration_minutes",
        ]

        read_only_fields = [
            "status",
        ]


    def to_representation(self, instance):

        data = super().to_representation(instance)

        data["patient"] = self.get_person_repr(
            instance.patient
        )

        return data


    def validate(self, attrs):

        request = self.context["request"]

        attrs["doctor"] = request.user.doctor
        attrs["status"] = Appointment.Status.CONFIRMED


        if self.has_conflict(
            doctor=attrs["doctor"],
            patient=attrs["patient"],
            scheduled_time=attrs["scheduled_time"],
            appointment_type=attrs.get(
                "appointment_type"
            ),
            duration_minutes=attrs.get(
                "duration_minutes"
            ),
            exclude_id=(
                self.instance.id
                if self.instance
                else None
            ),
        ):
            raise serializers.ValidationError(
                "This time slot conflicts with another appointment."
            )
        
        if not self.suitable_for_dr(
            doctor=attrs["doctor"],
            patient=attrs["patient"],
            scheduled_time=attrs["scheduled_time"],
            appointment_type=attrs.get("appointment_type"),
            duration_minutes=attrs.get("duration_minutes"),
        ):
            raise serializers.ValidationError({
                "scheduled_time": "This appointment may fall outside the doctor's working hours."
            })

        return attrs




# =========================
# Patient Create Appointment
# =========================

class PatientAppointmentSerializer(BaseAppointmentSerializer):

    doctor = serializers.SlugRelatedField(
        slug_field="user__public_id",
        queryset=Doctor.objects.all(),
        write_only=True,
    )


    class Meta:
        model = Appointment

        fields = [
            "doctor",
            "scheduled_time",
            "reason_for_visit",
            "notes",
            "status",
            "appointment_type",
            "duration_minutes",
        ]

        read_only_fields = [
            "status",
            "appointment_type",
            "duration_minutes",
        ]


    def to_representation(self, instance):

        data = super().to_representation(instance)

        data["doctor"] = self.get_person_repr(
            instance.doctor
        )

        return data


    def validate(self, attrs):

        patient = self.context["request"].user.patient


        if self.has_conflict(
            doctor=attrs["doctor"],
            patient=patient,
            scheduled_time=attrs["scheduled_time"],
            appointment_type=attrs.get(
                "appointment_type"
            ),
            duration_minutes=attrs.get(
                "duration_minutes"
            ),
            exclude_id=(
                self.instance.id
                if self.instance
                else None
            ),
        ):
            raise serializers.ValidationError(
                "This time slot conflicts with another appointment."
            )


        if not self.suitable_for_dr(
            doctor=attrs["doctor"],
            patient=patient,
            scheduled_time=attrs["scheduled_time"],
            appointment_type=attrs.get("appointment_type"),
            duration_minutes=attrs.get("duration_minutes"),
        ):
            raise serializers.ValidationError({
                "scheduled_time": "This appointment may fall outside the doctor's working hours."
            })

        return attrs


    def create(self, validated_data):

        validated_data["patient"] = (
            self.context["request"]
            .user
            .patient
        )

        validated_data["status"] = (
            Appointment.Status.PENDING
        )

        return super().create(validated_data)



# =========================
# Doctor Update Appointment
# =========================

class DoctorAppointmentUpdateSerializer(BaseAppointmentSerializer):

    patient = serializers.SerializerMethodField()


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


    def get_patient(self, obj):
        return self.get_person_repr(
            obj.patient
        )


    def validate_status(self, value):

        if self.instance.status == Appointment.Status.COMPLETED:
            raise serializers.ValidationError(
                "Cannot change the status of a completed appointment."
            )

        return value



    def validate(self, attrs):

        if self.has_conflict(
            doctor=self.instance.doctor,
            patient=self.instance.patient,
            scheduled_time=self.instance.scheduled_time,
            appointment_type=attrs.get(
                "appointment_type",
                self.instance.appointment_type,
            ),
            duration_minutes=attrs.get(
                "duration_minutes",
                self.instance.duration_minutes,
            ),
            exclude_id=self.instance.id,
        ):
            raise serializers.ValidationError(
                "This time slot conflicts with another appointment."
            )
        
        if not self.suitable_for_dr(
            doctor=self.instance.doctor,
            patient=self.instance.patient,
            scheduled_time=self.instance.scheduled_time,
            appointment_type=attrs.get(
                "appointment_type",
                self.instance.appointment_type,
            ),
            duration_minutes=attrs.get(
                "duration_minutes",
                self.instance.duration_minutes,
            ),
        ):
            raise serializers.ValidationError({
                "scheduled_time": "This appointment may fall outside the doctor's working hours."
            })

        return attrs



# =========================
# Doctor Pending List
# =========================

class DoctorPendingAppointmentSerializer(BaseAppointmentSerializer):

    patient = serializers.SerializerMethodField()


    class Meta:
        model = Appointment

        fields = [
            "public_id",
            "patient",
            "scheduled_time",
            "reason_for_visit",
            "appointment_type",
            "created_at",
        ]


    def get_patient(self, obj):
        return self.get_person_repr(
            obj.patient
        )