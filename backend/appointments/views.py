from datetime import timedelta
from django.utils.dateparse import parse_date
from django.db import transaction
from django.utils import timezone
from datetime import date, datetime
from django.db.models import Q
from rest_framework.generics import( 
    ListCreateAPIView, 
    RetrieveUpdateAPIView,
    ListAPIView,
    UpdateAPIView
)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import uuid

from accounts.permissions import IsDoctor, IsManager, IsPatient
from logs.models import ActivityLog
from notifications.models import Notification
from .models import Appointment
from doctor.models import Doctor
from .serializers import (
    BaseAppointmentSerializer,
    DoctorAppointmentSerializer,
    DoctorAppointmentUpdateSerializer,
    ManagerAppointmentSerializer,
    PatientAppointmentSerializer,
    DoctorPendingAppointmentSerializer,
    PatientCancelAppointment,
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
        Notification.create_notification(
            user=appointment.doctor.user,
            notification_type=Notification.Type.APPOINTMENT,
            title="Appointment created",
            message=f"An appointment was booked for you with patient {appointment.patient.user.get_full_name()} by {request.user.get_full_name()}.",
            appointment=appointment,
        )

        Notification.create_notification(
            user=appointment.patient.user,
            notification_type=Notification.Type.APPOINTMENT,
            title="Appointment created",
            message=f"An appointment was booked for you with Dr. {appointment.doctor.user.get_full_name()}.",
            appointment=appointment,
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

        if appointment.patient.user:
            description = (
                f"Doctor {self.request.user.username} created appointment "
                f"for patient {appointment.patient.user.username}."
            )
            Notification.create_notification(
                user=appointment.patient.user,
                notification_type=Notification.Type.APPOINTMENT,
                title="Appointment created",
                message=f"Dr. {self.request.user.get_full_name()} booked an appointment with you at {appointment.scheduled_time}",
                appointment=appointment,
            )
        else:
            description = (
                f"Doctor {self.request.user.username} created appointment "
                f"for guest patient {appointment.patient.first_name} {appointment.patient.last_name}."
            )

        ActivityLog.objects.create(
            user=self.request.user,
            action=ActivityLog.Action.APPOINTMENT_CREATED,
            description=description,
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

        Notification.create_notification(
            user=appointment.doctor.user,
            notification_type=Notification.Type.APPOINTMENT,
            title="Appointment created",
            message=f"You have a pending appointment with {self.request.user.get_full_name()}",
            appointment=appointment,
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

        if old_status != new_status:
            if new_status == "confirmed":
                Notification.create_notification(
                    user=instance.patient.user,
                    notification_type=Notification.Type.APPOINTMENT,
                    title="Appointment confirmed",
                    message=f"Your appointment with Dr. {self.request.user.get_full_name()} has just been confirmed.",
                    appointment=instance
                )
            elif new_status == "completed":
                Notification.create_notification(
                    user=instance.patient.user,
                    notification_type=Notification.Type.APPOINTMENT,
                    title="Appointment completed",
                    message=f"You have completed an appointment with Dr. {self.request.user.get_full_name()}.",
                    appointment=instance,
                )
            elif new_status == "cancelled":
                Notification.create_notification(
                    user=instance.patient.user,
                    notification_type=Notification.Type.APPOINTMENT,
                    title="Appointment cancelled",
                    message=f"Your appointment got canceled by Dr. {self.request.user.get_full_name()}.",
                    appointment=instance,
                )

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
    permission_classes = [IsAuthenticated, IsPatient]

    def get(self, request):
        # 1) Get the info from the request
        date_str = request.query_params.get("date")
        doctor_public_id = request.query_params.get("doctor")
        appointment_type = request.query_params.get("type")
        
        #  1.1) check the date
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
                    "detail": "Date is required. Use YYYY-MM-DD."
                },
                status=400,
            )
        # 1.2) check the doctor
        if not doctor_public_id:
            return Response({"detail": "Doctor is required."}, status=400)

        try:
            uuid.UUID(doctor_public_id)
        
        except (ValueError, TypeError):
            return Response({"detail": "Invalid doctor id."}, status=400)
        
        doctor = Doctor.objects.filter(user__public_id=doctor_public_id).first()

        if doctor is None:
            return Response({"detail": "Doctor not found."}, status=404)
        # 1.3) check the type
        if appointment_type:
            if appointment_type == "consultation":
                appointment_type = Appointment.AppointmentType.CONSULTATION
            elif appointment_type == "checkup":
                appointment_type = Appointment.AppointmentType.CHECKUP
            else:
                return Response({"detail": "Invalid appointment type."}, status=400)
        else:
            return Response({"detail": "appointment type is required."}, status=400)

        # 2) Find the duration
        if appointment_type == Appointment.AppointmentType.CONSULTATION:
            duration = doctor.consultation_duration
        elif appointment_type == Appointment.AppointmentType.CHECKUP:
            duration = doctor.checkup_duration
        else:
            return Response({"detail": "Unsupported appointment type."}, status=400)
        
        # 3) Find the doctor's working hours for that day
        if doctor.start_time and doctor.end_time:
            day_start = timezone.make_aware(datetime.combine(selected_date, doctor.start_time))
            day_end = timezone.make_aware(datetime.combine(selected_date, doctor.end_time))
        else:
            return Response({"detail": "The doctor hasn't set the available hours yet."}, status=409)
        
        # 4) Get the doctor's existing appointments
        appointments = Appointment.objects.filter(
            doctor=doctor,
            scheduled_time__gte=day_start,
            scheduled_time__lte=day_end,
        ).filter(
            Q(status=Appointment.Status.PENDING) | Q(status=Appointment.Status.CONFIRMED)
        )
        # 5) Make a list of possible times
        possible_times = []
        step = timedelta(minutes=duration)
        current = day_start

        while current + step <= day_end:
            possible_times.append(current)
            current = current + step

        # 6) Check each time for overlap
        available_times = []
        for candidate in possible_times:
            candidate_end = candidate + step
            conflict = False
            for appt in appointments:
                if candidate < appt.end_time and candidate_end > appt.scheduled_time:
                    conflict = True
                    break
            if not conflict:
                available_times.append(candidate)
        
        # 7) Remove past times
        future_times = []
        for time in available_times:
            if time >= timezone.now():
                future_times.append(time)
        available_times = future_times

        # 8) Mark the times that will conflict with the patient appointments
        patient = request.user.patient
        patient_appointments = Appointment.objects.filter(
            patient=patient,
            scheduled_time__gte=day_start,
            scheduled_time__lte=day_end,
        ).filter(
            Q(status=Appointment.Status.PENDING) | Q(status=Appointment.Status.CONFIRMED)
        )

        final_available_times = []
        for candidate in available_times:
            candidate_end = candidate + step
            conflict = False
            for appt in patient_appointments:
                if candidate < appt.end_time and candidate_end > appt.scheduled_time:
                    conflict = True
                    break
            final_available_times.append({"time": candidate, "conflict_with_patient": conflict})

        # 9) Return the free times
        return Response(final_available_times)

class AppointmentCancelView(UpdateAPIView):
    serializer_class = PatientCancelAppointment
    permission_classes = [IsAuthenticated, IsPatient]
    lookup_field = "public_id"

    def get_queryset(self):
        return Appointment.objects.filter(
            patient=self.request.user.patient
        )
    