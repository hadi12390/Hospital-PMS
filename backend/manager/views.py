from rest_framework.generics import CreateAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Count, Q
from django.contrib.auth import get_user_model
from datetime import date

from accounts.permissions import IsManager
from .serializers import AddDoctorSerializer
from appointments.serializers import ManagerAppointmentSerializer
from appointments.models import Appointment
from doctor.models import Doctor
from logs.models import ActivityLog

User = get_user_model()

class AddDoctor(CreateAPIView):
    serializer_class = AddDoctorSerializer
    permission_classes = [IsManager]


class ManagerAddAppointment(CreateAPIView):
    serializer_class = ManagerAppointmentSerializer
    permission_classes = [IsManager]

class ManagerDashboard(APIView):

    permission_classes = [IsManager]

    def get(self, request):
        
        now = timezone.now()
        appointments = Appointment.objects.all().select_related(
            "patient__user", "doctor__user"
        )

        logs = ActivityLog.objects.all().order_by("-created_at")[:4]

        today_appointments = list(
            appointments.filter(completed_at__date=now.date()).order_by("-completed_at")
        )
        today_appointments_count = len(today_appointments)
        last_three = today_appointments[:3]
        today_patients = [
            appt.patient.user.get_full_name()
            for appt in today_appointments
            if appt.patient and appt.patient.user
        ]
        today_patients_count = len({appt.patient_id for appt in today_appointments})
        active_doctors = Doctor.objects.filter(
            start_time__lte=now.time(),
            end_time__gte=now.time(),
            user__status=User.Status.ACTIVE
        )
        active_doctors_count = active_doctors.count()
        appointment_status = appointments.aggregate(
            pending_appointments = Count("id", filter=Q(status=Appointment.Status.PENDING)),
            cancelled_appointments = Count("id", filter=Q(status=Appointment.Status.CANCELLED)),
            confirmed_appointments = Count("id", filter=Q(status=Appointment.Status.CONFIRMED)),
            completed_appointments = Count("id", filter=Q(status=Appointment.Status.COMPLETED)),
        )
        return Response({
            "today": {
                "appointments_count": today_appointments_count,
                "last_three": [
                    {
                        "public_id": appt.public_id,
                        "patient_name": (
                            appt.patient.user.get_full_name()
                            if appt.patient and appt.patient.user else None
                        ),
                        "doctor_name": (
                            appt.doctor.user.get_full_name()
                            if appt.doctor and appt.doctor.user else None
                        ),
                        "completed_at": appt.completed_at,
                    }
                    for appt in last_three
                ],
                "patients": today_patients,
                "patients_count": today_patients_count,
            },
            "doctors": {
                "active_count": active_doctors_count,
            },
            "appointments_by_status": appointment_status,
            "recent_activity": [
                {
                    "user": log.user.get_full_name() if log.user else None,
                    "action": log.action,
                    "created_at": log.created_at,
                }
                for log in logs
            ],
        }, status=200)

