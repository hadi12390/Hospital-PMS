from django.db.models import Count, Q
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsDoctor
from appointments.models import Appointment


class DoctorDashboard(APIView):

    permission_classes = [IsAuthenticated, IsDoctor]

    def get(self, request):

        doctor_profile = getattr(request.user, "doctor", None)

        if not doctor_profile:
            return Response(
                {"detail": "Doctor profile not found"},
                status=404
            )

        now = timezone.now()

        appointments = Appointment.objects.filter(
            doctor=doctor_profile
        )

        since = appointments.order_by(
            "created_at"
        ).first()


        stats = appointments.aggregate(
            total_appointments=Count("id"),

            completed_appointments=Count(
                "id",
                filter=Q(
                    status=Appointment.Status.COMPLETED
                )
            ),

            upcoming_appointments=Count(
                "id",
                filter=Q(
                    scheduled_time__gte=now
                )
            ),

            cancelled_appointments=Count(
                "id",
                filter=Q(
                    status=Appointment.Status.CANCELLED
                )
            ),

            no_show_appointments=Count(
                "id",
                filter=Q(
                    status=Appointment.Status.NO_SHOW
                )
            ),

            total_patients=Count(
                "patient",
                distinct=True
            ),
        )


        stats["since"] = (
            since.created_at.strftime("%Y-%m-%d %H:%M:%S")
            if since else None
        )


        possible_current = appointments.filter(
            status=Appointment.Status.CONFIRMED,
            scheduled_time__lte=now,
        ).select_related(
            "patient__user"
        ).order_by(
            "-scheduled_time"
        ).first()


        current_appointment = None

        if possible_current and possible_current.end_time >= now:
            current_appointment = possible_current


        stats["current_appointment"] = (
            {
                "id": current_appointment.id,
                "patient": current_appointment.patient.user.username,
                "scheduled_time": current_appointment.scheduled_time,
                "end_time": current_appointment.end_time,
                "type": current_appointment.appointment_type,
            }
            if current_appointment
            else None
        )


        return Response(stats)