from rest_framework.generics import ListCreateAPIView
from .models import Appointment
from .serializers import (
    ManagerAppointmentSerializer,
    DoctorAppointmentSerializer,
    PatientAppointmentSerializer,
)
from accounts.permissions import IsManager, IsDoctor, IsPatient
from logs.models import ActivityLog
from django.db import transaction

class ManagerListCreateAppointment(ListCreateAPIView):
    serializer_class = ManagerAppointmentSerializer
    permission_classes = [IsManager]

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
            )
        )
    
    queryset = Appointment.objects.select_related("patient__user", "doctor__user").all()
    

class DoctorListCreateAppointment(ListCreateAPIView):
    serializer_class = DoctorAppointmentSerializer
    permission_classes = [IsDoctor]
    
    def get_queryset(self):
        doctor_profile = getattr(self.request.user, "doctor", None)
        if not doctor_profile:
            return Appointment.objects.none()
        return Appointment.objects.filter(doctor=doctor_profile).select_related("patient__user")
    
    @transaction.atomic
    def perform_create(self, serializer):
        appointment = serializer.save()
        ActivityLog.objects.create(
            user=self.request.user,
            action=ActivityLog.Action.APPOINTMENT_CREATED,
            description=(
                f"Doctor {self.request.user.username} created appointment "
                f"for patient {appointment.patient.user.username}."
            )
        )
    

class PatientListCreateAppointment(ListCreateAPIView):
    serializer_class = PatientAppointmentSerializer
    permission_classes = [IsPatient]

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
            )
        )
