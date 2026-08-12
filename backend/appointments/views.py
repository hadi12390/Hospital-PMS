from datetime import timedelta
from django.utils.dateparse import parse_date
from django.db import transaction
from django.utils import timezone
from rest_framework.generics import( 
    ListCreateAPIView, 
    RetrieveUpdateAPIView,
    ListAPIView,
    )
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import uuid

from accounts.permissions import IsDoctor, IsManager, IsPatient
from logs.models import ActivityLog
from .models import Appointment
from .serializers import (
    DoctorAppointmentSerializer,
    DoctorAppointmentUpdateSerializer,
    ManagerAppointmentSerializer,
    PatientAppointmentSerializer,
    DoctorPendingAppointmentSerializer,
)

class ManagerListCreateAppointment(ListCreateAPIView):
    queryset = Appointment.objects.select_related("patient__user", "doctor__user").all()
    serializer_class = ManagerAppointmentSerializer
    permission_classes = [IsAuthenticated, IsManager]

    @transaction.atomic
    def perform_create(self, serializer):
        appointment = serializer.save()
        ActivityLog.objects.create(
            user=self.request.user,
            action=ActivityLog.Action.APPOINTMENT_CREATED,
            description=(
                f"Manager {self.request.user.username} created appointment "
                f"for patient {appointment.patient.user.username} "
                f"with doctor {appointment.doctor.user.username}."
            ),
        )


class DoctorListCreateAppointment(ListCreateAPIView):
    serializer_class = DoctorAppointmentSerializer
    permission_classes = [IsAuthenticated, IsDoctor]

    def get_queryset(self):
        doctor_profile = getattr(self.request.user, "doctor", None)
        if not doctor_profile:
            return Appointment.objects.none()
        return (
            Appointment.objects.filter(doctor=doctor_profile)
            .select_related("patient__user")
            .order_by("-scheduled_time")
        )

    @transaction.atomic
    def perform_create(self, serializer):
        appointment = serializer.save()
        if (appointment.patient.user):
            ActivityLog.objects.create(
                user=self.request.user,
                action=ActivityLog.Action.APPOINTMENT_CREATED,
                description=(
                    f"Doctor {self.request.user.username} created appointment "
                    f"for patient {appointment.patient.user.username}."
                ),
            )
        else:
            ActivityLog.objects.create(
                user=self.request.user,
                action=ActivityLog.Action.APPOINTMENT_CREATED,
                description=(
                    f"Doctor {self.request.user.username} created appointment"
                    f"for guest patient {appointment.patient.first_name} {appointment.patient.last_name}."
                ),
            )


class PatientListCreateAppointment(ListCreateAPIView):
    serializer_class = PatientAppointmentSerializer
    permission_classes = [IsAuthenticated, IsPatient]

    def get_queryset(self):
        patient_profile = getattr(self.request.user, "patient", None)
        if not patient_profile:
            return Appointment.objects.none()
        return Appointment.objects.filter(patient=patient_profile).select_related("doctor__user")

    @transaction.atomic
    def perform_create(self, serializer):
        appointment = serializer.save()
        ActivityLog.objects.create(
            user=self.request.user,
            action=ActivityLog.Action.APPOINTMENT_CREATED,
            description=(
                f"Patient {self.request.user.username} booked an appointment "
                f"with doctor {appointment.doctor.user.username}."
            ),
        )


class DoctorAppointmentDetailView(RetrieveUpdateAPIView):
    serializer_class = DoctorAppointmentUpdateSerializer
    permission_classes = [IsAuthenticated, IsDoctor]
    lookup_field = 'public_id'

    def get_queryset(self):
        doctor_profile = getattr(self.request.user, "doctor", None)
        if not doctor_profile:
            return Appointment.objects.none()
        return Appointment.objects.filter(doctor=doctor_profile).select_related("patient__user")

    @transaction.atomic
    def perform_update(self, serializer):
        # 1. Grab old_status BEFORE saving
        instance = self.get_object()
        old_status = instance.status

        # 2. Save directly via serializer (pass extra kwargs to update_fields safely)
        now = timezone.now()
        extra_kwargs = {}
        
        # Check updated validated data from serializer
        new_status = serializer.validated_data.get("status", old_status)

        if old_status != new_status:
            if new_status == "confirmed":
                extra_kwargs["confirmed_at"] = now
            elif new_status == "completed":
                extra_kwargs["completed_at"] = now
            elif new_status == "cancelled":
                extra_kwargs["cancelled_at"] = now

        # Save once with timestamps included — avoids calling appointment.save() twice!
        appointment = serializer.save(**extra_kwargs)

        # 3. Log activity
        if old_status != new_status:
            ActivityLog.objects.create(
                user=self.request.user,
                action=ActivityLog.Action.APPOINTMENT_UPDATED,
                description=(
                    f"Doctor {self.request.user.username} updated appointment status "
                    f"from '{old_status}' to '{new_status}' for patient {appointment.patient.user.username}."
                ),
            )

class PendingAppointmentsView(ListAPIView):
    serializer_class = DoctorPendingAppointmentSerializer
    permission_classes = [IsAuthenticated, IsDoctor]

    def get_queryset(self):
        doctor_profile = getattr(self.request.user, "doctor", None)
        if not doctor_profile:
            return Appointment.objects.none()
        return(
            Appointment.objects.filter(
                doctor=doctor_profile, 
                status=Appointment.Status.PENDING
                )
                .select_related("patient__user")
                .order_by("scheduled_time")
        )

class AvailableTimesView(APIView):
    permission_classes = [IsAuthenticated, (IsPatient | IsDoctor | IsManager)]

    def get(self, request):
        date_str = request.query_params.get("date")
        doctor_public_id = request.query_params.get("doctor")
        appointment_type = request.query_params.get("type")
        # check the date
        if date_str:
            selected_date = parse_date(date_str)

            if selected_date is None:
                return Response(
                    {
                        "detail": "Invalid date format. Use YYYY-MM-DD."
                    },
                    status=400,
                )
        else:
            return Response(
                {
                    "detail": "There is no date. Use YYYY-MM-DD."
                },
                status=400,
            )
            # check the doctor
            if not doctor_public_id:
                return Response({"detail": "Doctor is required."}, status=400)

            try:
                uuid.UUID(doctor_public_id)
            
            except (ValueError, TypeError):
                return Response({"detail": "Invalid doctor id."}, status=400)
            
            doctor = Doctor.objects.filter(user__public_id=doctor_public_id).first()

            if doctor is None:
                return Response({"detail": "Doctor not found."}, status=404)
            
        
        