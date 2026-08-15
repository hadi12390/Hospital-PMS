from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Count, Q

from .serializers import ProfileSerializer
from appointments.models import Appointment
from accounts.permissions import IsPatient
from notifications.models import Notification

class ProfileEditView(RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsPatient]

    def get_object(self):
        return self.request.user.patient

class PatientDashboard(APIView):

    permission_classes = [IsPatient]

    def appointment_summary(self, appointment):

        if not appointment:
            return None

        return {
            "doctor": {
                "public_id": (
                    str(appointment.doctor.user.public_id)
                    if appointment.doctor.user
                    else None
                ),
                "name": appointment.doctor.user.get_full_name(),
            },
            "scheduled_time": appointment.scheduled_time,
            "day": appointment.scheduled_time.strftime("%A"),
            "date": appointment.scheduled_time.strftime("%Y-%m-%d"),
            "end_time": appointment.end_time,
            "appointment_type": appointment.appointment_type,
            "status": appointment.status,
        }
    def notifications_method(self, notification):
        if not notification:
            return None
        return{
            "title": notification.title,
            "message": notification.message,
            "created_at": notification.created_at
        }
    
    def get(self, request):

        patient_profile = getattr(request.user, "patient", None)

        if not patient_profile:
            return Response(
                {"detail": "Patient profile not found"},
                status=404,
            )

        now = timezone.now()

        appointments = (
            Appointment.objects
            .filter(patient=patient_profile)
            .select_related("doctor__user")
        )
        notifications = (
            Notification.objects
            .filter(user=request.user)
        )

        next_appointment = (
            appointments
            .filter(
                status=Appointment.Status.CONFIRMED,
                scheduled_time__gt=now,
            )
            .order_by("scheduled_time")
            .first()
        )

        last_appointment = (
            appointments
            .filter(
                status=Appointment.Status.COMPLETED,
            )
            .order_by("-completed_at")
            .first()
        )

        latest_unread_notifications = (
            notifications
            .filter(is_read=False)
            .order_by("-created_at")[:2]
        )
        last_doctor = last_appointment.doctor.user.get_full_name() if last_appointment else None
        
        stats = appointments.aggregate(
            pending_appointments=Count(
                "id",
                filter=Q(status=Appointment.Status.PENDING),            
            ),
            visits = Count(
                "id",
                filter=Q(
                    status=Appointment.Status.COMPLETED,
                ),
            )
        )

        stats["latest_unread_notifications"] = [
            self.notifications_method(notification)
            for notification in latest_unread_notifications
        ]

        stats["last_appointment"] = self.appointment_summary(last_appointment)
        stats["last_doctor"] = last_doctor
        stats["next_appointment"] = self.appointment_summary(next_appointment)

        return Response(stats)