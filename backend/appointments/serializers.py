from rest_framework import serializers
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta

from .models import Appointment
from doctor.models import Doctor
from patient.models import Patient
from configuration.models import ClinicConfiguration, ReliabilityPolicy
from logs.models import ActivityLog
from notifications.models import Notification

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
    
    def get_reliability_policy(self, patient):

        policy = (
            ReliabilityPolicy.objects
            .filter(min_reliability__lte=patient.reliability)
            .order_by("-min_reliability")
            .first()
        )

        if policy is None:
            raise serializers.ValidationError(
                "No reliability policy has been configured. Please contact the clinic administrator."
            )
        return policy

    def at_pending_limit(self, patient):
        appointments = Appointment.objects.filter(
            patient=patient,
            status=Appointment.Status.PENDING
        ).count()
        
        policy = self.get_reliability_policy(patient)

        return appointments >= policy.max_pending_appointments

    def is_in_the_past(self, scheduled_time):
        return scheduled_time < timezone.now()

    def exceeds_booking_window(self, scheduled_time, patient):

        policy = self.get_reliability_policy(patient)

        return scheduled_time > timezone.now() + timedelta(days=policy.max_advance_booking_days)

    def online_booking_blocked(self, patient):

        policy = self.get_reliability_policy(patient)

        return policy.block_online_booking
    
    def get_full_name(self, person):
        if person is None:
            return None

        if getattr(person, "user", None):
            return person.user.get_full_name()

        return getattr(person, "name", None)

    def get_profile_picture(self, person):
        try:
            if person.user.profile_picture:
                return self.context['request'].build_absolute_uri(person.user.profile_picture.url)
        except Exception:
            pass
        return None
    
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
            'profile_picture': self.get_profile_picture(person)
        }
    
    patient = serializers.UUIDField(write_only=True)
    doctor = serializers.UUIDField(write_only=True)

    def validate_patient(self, value):
        try:
            return Patient.objects.get(user__public_id=value)
        except Patient.DoesNotExist:
            raise serializers.ValidationError("Patient not found.")
        
    def validate_doctor(self, value):
        try:
            return Doctor.objects.get(user__public_id=value)
        except Patient.DoesNotExist:
            raise serializers.ValidationError("Patient not found.")


# =========================
# Manager Create Serializer
# =========================

class ManagerAppointmentSerializer(BaseAppointmentSerializer):

    end_time = serializers.ReadOnlyField()

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
            "end_time",
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["doctor"] = self.get_person_repr(instance.doctor)
        data["patient"] = self.get_person_repr(instance.patient)
        return data
    
            




# =========================
# Doctor Create Appointment
# =========================

class DoctorAppointmentSerializer(BaseAppointmentSerializer):


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

        if self.is_in_the_past(attrs["scheduled_time"]):
            raise serializers.ValidationError(
                "You cannot create an appointment for a date or time in the past."
            )
        
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
    appointment_type = serializers.ChoiceField(
        choices=[
            (Appointment.AppointmentType.CONSULTATION, Appointment.AppointmentType.CONSULTATION.label),
            (Appointment.AppointmentType.CHECKUP, Appointment.AppointmentType.CHECKUP.label),
        ]
    )

    class Meta:
        model = Appointment

        fields = [
            "public_id",
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
            "duration_minutes",
        ]


    def to_representation(self, instance):

        data = super().to_representation(instance)

        data["doctor"] = self.get_person_reprget_person_repr(
            instance.doctor
        )

        return data


    def validate(self, attrs):

        patient = self.context["request"].user.patient
        
        if self.online_booking_blocked(patient):

            raise serializers.ValidationError(
                "Online appointment booking is currently unavailable for your account. "
                "Please contact the clinic for assistance."
            )
        
        if self.is_in_the_past(attrs["scheduled_time"]):
            raise serializers.ValidationError(
                "You cannot create an appointment for a date or time in the past."
            )

        if self.exceeds_booking_window(attrs["scheduled_time"], patient):
            config = ClinicConfiguration.objects.first()
            raise serializers.ValidationError(
                f"You cannot book an appointment more than {config.max_advance_booking_days} days in advance."
            )
        
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

        if self.at_pending_limit(patient=patient):
            configuration = ClinicConfiguration.objects.first()
            raise serializers.ValidationError(
                f"Unfortunately, you have reached the maximum of {configuration.max_pending_appointments} pending appointments. Please complete or cancel an existing appointment before booking another."
            )

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

        scheduled_time = attrs.get("scheduled_time")

        if scheduled_time and self.is_in_the_past(scheduled_time):
            raise serializers.ValidationError(
                "You cannot create an appointment for a date or time in the past."
            )
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

class PatientCancelAppointment(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ["status"]

    def validate_status(self, value):
        if value != Appointment.Status.CANCELLED:
            raise serializers.ValidationError(
                "Patients may only cancel appointments."
            )

        if self.instance.status in [
            Appointment.Status.CANCELLED,
            Appointment.Status.COMPLETED,
            Appointment.Status.NO_SHOW,
        ]:
            raise serializers.ValidationError(
                "This appointment cannot be cancelled."
            )

        return value

    def update(self, instance, validated_data):
        old_status = instance.status
        new_status = Appointment.Status.CANCELLED

        instance.status = new_status
        instance.cancelled_at = timezone.now()

        instance.save(
            update_fields=[
                "status",
                "cancelled_at",
            ]
        )

        request = self.context["request"]

        ActivityLog.objects.create(
            user=request.user,
            action=ActivityLog.Action.APPOINTMENT_UPDATED,
            description=(
                f"Patient {request.user.username} canceled appointment "
                f"from '{old_status}' to '{new_status}' "
            ),
        )

        Notification.create_notification(
            user=instance.doctor.user,
            notification_type=Notification.Type.APPOINTMENT,
            title="Appointment Canceled",
            message=f"Patient {request.user.username} canceled their appointment",
            appointment=instance
        )

        return instance

class ManagerAppointmentUpdateSerializer(BaseAppointmentSerializer):
    
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

        scheduled_time = attrs.get("scheduled_time")

        if scheduled_time and self.is_in_the_past(scheduled_time):
            raise serializers.ValidationError(
                "You cannot create an appointment for a date or time in the past."
            )
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
