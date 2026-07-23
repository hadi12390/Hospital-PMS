from datetime import timedelta

from django.db.models import Count, Q
from django.utils import timezone
from django.utils.dateparse import parse_date

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsDoctor
from appointments.models import Appointment


class DoctorDashboard(APIView):

    permission_classes = [IsAuthenticated, IsDoctor]

    def appointment_summary(self, appointment):
        """Return a simplified representation of an appointment."""
        if not appointment:
            return None

        return {
            "id": appointment.id,
            "patient": appointment.patient.user.username,
            "scheduled_time": appointment.scheduled_time,
            "day": appointment.scheduled_time.strftime("%A"),
            "date": appointment.scheduled_time.strftime("%Y-%m-%d"),
            "end_time": appointment.end_time,
            "appointment_type": appointment.appointment_type,
            "status": appointment.status,
        }

    def get(self, request):

        doctor_profile = getattr(request.user, "doctor", None)

        if not doctor_profile:
            return Response(
                {"detail": "Doctor profile not found"},
                status=404,
            )

        now = timezone.now()

        # Get the requested date from frontend
        date_str = request.query_params.get("date")

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
            selected_date = timezone.localdate()


        # Calculate the selected week's range
        week_start = selected_date - timedelta(
            days=selected_date.weekday()
        )

        week_end = week_start + timedelta(days=6)


        # Doctor's appointments only
        appointments = (
            Appointment.objects
            .filter(doctor=doctor_profile)
            .select_related("patient__user")
        )


        # First appointment (Since)
        since = appointments.order_by(
            "created_at"
        ).first()


        # Dashboard statistics
        stats = appointments.aggregate(

            total_appointments=Count("id"),

            completed_appointments=Count(
                "id",
                filter=Q(
                    status=Appointment.Status.COMPLETED
                ),
            ),

            upcoming_appointments=Count(
                "id",
                filter=Q(
                    scheduled_time__gte=now
                ),
            ),

            cancelled_appointments=Count(
                "id",
                filter=Q(
                    status=Appointment.Status.CANCELLED
                ),
            ),

            no_show_appointments=Count(
                "id",
                filter=Q(
                    status=Appointment.Status.NO_SHOW
                ),
            ),

            total_patients=Count(
                "patient",
                distinct=True,
            ),
        )


        stats["since"] = (
            since.created_at.strftime("%Y-%m-%d %H:%M:%S")
            if since
            else None
        )


        # Current appointment
        possible_current = (
            appointments
            .filter(
                status=Appointment.Status.CONFIRMED,
                scheduled_time__lte=now,
            )
            .order_by("-scheduled_time")
            .first()
        )


        current_appointment = None

        if (
            possible_current
            and possible_current.end_time
            and possible_current.end_time >= now
        ):
            current_appointment = possible_current



        # Next appointment
        next_appointment = (
            appointments
            .filter(
                status=Appointment.Status.CONFIRMED,
                scheduled_time__gt=now,
            )
            .order_by("scheduled_time")
            .first()
        )



        # This week's appointments
        week_appointments = (
            appointments
            .exclude(
                status=Appointment.Status.CANCELLED
            )
            .filter(
                scheduled_time__date__range=(
                    week_start,
                    week_end
                )
            )
            .order_by("scheduled_time")
        )



        # Add extra dashboard data
        stats["current_appointment"] = self.appointment_summary(
            current_appointment
        )

        stats["next_appointment"] = self.appointment_summary(
            next_appointment
        )

        stats["week_appointments"] = [
            self.appointment_summary(appointment)
            for appointment in week_appointments
        ]


        return Response(stats)