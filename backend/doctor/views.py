from django.db.models import Count, Q
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from accounts.permissions import IsDoctor
from appointments.models import Appointment 


class DoctorTotal(APIView):
    # Require BOTH logged-in status and Doctor role
    permission_classes = [IsAuthenticated, IsDoctor]

    def get(self, request):
        doctor_profile = getattr(request.user, "doctor", None)
        if not doctor_profile:
            return Response(
                {"detail": "Doctor profile not found"}, 
                status=404
            )

        # Base queryset filtered for this doctor
        appointments = Appointment.objects.filter(doctor=doctor_profile)

        # 1. Fetch first appointment date
        first_appt = appointments.order_by("created_at").first()

        # 2. Aggregate all counts in ONE database hit
        stats = appointments.aggregate(
            total_appointments=Count("id"),
            completed_appointments=Count("id", filter=Q(status="completed")),
            upcoming_appointments=Count("id", filter=Q(appointment_date__gte=timezone.now())),
            cancelled_appointments=Count("id", filter=Q(status="cancelled")),
            no_show_appointments=Count("id", filter=Q(status="no_show")),
            total_patients=Count("patient", distinct=True),
        )

        # Add the first appointment date to the response
        stats["first_appointment"] = (
            first_appt.created_at.strftime("%Y-%m-%d %H:%M:%S") 
            if first_appt else None
        )

        return Response(stats)