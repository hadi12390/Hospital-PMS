from datetime import timedelta

from django.db.models import Count, Q
from django.utils import timezone
from django.utils.dateparse import parse_date

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import RetrieveUpdateAPIView, ListAPIView
from django.contrib.auth import get_user_model

from accounts.permissions import IsDoctor, IsPatient, IsManager, IsUnregisteredPatient
from appointments.models import Appointment
from .serializers import DoctorSerializer, ViewAllDoctorsSerializer
from .models import Doctor
from patient.models import Patient


User = get_user_model()


class DoctorDashboard(APIView):

    permission_classes = [IsAuthenticated, IsDoctor]

    def appointment_summary(self, appointment):
        """Return a simplified representation of an appointment."""
        if not appointment:
            return None
        if not appointment.patient:
            return {"patient": "Deleted Patient"}
        if appointment and appointment.patient and appointment.patient.user:
            patient = f"{appointment.patient.user.first_name} {appointment.patient.user.last_name}"
        else:
            patient = f"Guest: {appointment.patient.first_name} {appointment.patient.last_name}"
        
        return {
            "patient": {
                "public_id": (
                    str(appointment.patient.user.public_id)
                    if appointment.patient.user
                    else None
                ),
                "name": patient,
            },
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
            
            pending_appointments=Count(
                "id",
                filter=Q(
                    status=Appointment.Status.PENDING
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
                status__in=[
                    Appointment.Status.CANCELLED,
                    Appointment.Status.PENDING,
                ]
            )
            .filter(
                scheduled_time__date__range=(
                    week_start,
                    week_end
                )
            )
            .order_by("scheduled_time")
        )

        last_patient = (
            appointments
            .filter(
                status=Appointment.Status.COMPLETED,
            )
            .order_by("-completed_at")
            .first()
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

        stats["week_appointments_count"] = len(stats["week_appointments"])

        stats["last_patient"] = self.appointment_summary(last_patient)

        return Response(stats)

class DoctorProfileEditView(RetrieveUpdateAPIView):
    
    serializer_class = DoctorSerializer
    permission_classes = [IsDoctor]

    def get_object(self):
        return self.request.user.doctor

class ViewAllDoctors(ListAPIView):

    serializer_class = ViewAllDoctorsSerializer
    permission_classes = [IsDoctor | IsManager | IsPatient | IsUnregisteredPatient]
    queryset = Doctor.objects.select_related("user").filter(user__status=User.Status.ACTIVE)

class DoctorPatients(APIView):
    permission_classes = [IsDoctor]

    def patient_summary(self, patient):
        patient_user = patient.user if patient.user else None

        if patient_user:
            public_id = str(patient_user.public_id)
            name = patient_user.get_full_name()
            profile_picture = (
                self.request.build_absolute_uri(patient_user.profile_picture.url)
                if patient_user.profile_picture else None
            )
        elif patient:
            public_id = "User is guest."
            name = f"{patient.first_name} {patient.last_name}"
            profile_picture = None
        else:
            public_id = None
            name = "Unknown"
            profile_picture = None

        return {
            "public_id": public_id,
            "name": name,
            "profile_picture": profile_picture,
            "phone_number": getattr(patient, "phone_number", None),
            "birth_date": getattr(patient, "birth_date", None),
        }

    def get(self, request):
        doctor_profile = getattr(request.user, "doctor", None)

        if not doctor_profile:
            return Response(
                {"detail": "Doctor profile not found"},
                status=404,
            )

        appointments = Appointment.objects.filter(
            doctor=doctor_profile
        ).select_related("patient", "patient__user")

        patients = {}
        for appt in appointments:
            patient = appt.patient
            key = patient.user.public_id if patient and patient.user else id(patient) if patient else None
            if key is not None and key not in patients:
                patients[key] = self.patient_summary(patient)

        return Response(list(patients.values()))

class DoctorAppointments(APIView):
    permission_classes = [IsDoctor]

    def appointment_summary(self, appointment):
        patient_obj = appointment.patient
        patient_user = patient_obj.user if patient_obj.user else None

        if patient_user:
            patient_public_id = str(patient_user.public_id)
            patient_name = patient_user.get_full_name()
            profile_picture = (
                self.request.build_absolute_uri(patient_user.profile_picture.url)
                if patient_user.profile_picture else None
            )

        elif patient_obj:
            patient_public_id = "User Is guest."
            patient_name = f"{patient_obj.first_name} {patient_obj.last_name}"
            profile_picture = None
        else:
            patient_public_id = None
            patient_name = "Unknown"
            profile_picture = None
        return {
            "appointment_public_id": str(appointment.public_id),
            "patient": {
                "public_id": patient_public_id,
                "name": patient_name,

                "profile_picture": profile_picture
            },
            "appointment_type": appointment.appointment_type,
            "resone_for_visit": appointment.reason_for_visit,
            "date": appointment.scheduled_time,
            "status": appointment.status,
        }        

    def get(self, request):
        doctor_profile = getattr(request.user, "doctor", None)

        if not doctor_profile:
            return Response(
                {"detail": "Doctor profile not found"},
                status=404,
            )
        
        appointments = Appointment.objects.filter(doctor=doctor_profile).select_related("patient", "patient__user")

        stats = [
            self.appointment_summary(appt)
            for appt in appointments
        ]

        return Response(stats)

class TodaySchedule(APIView):
    permission_classes = [IsDoctor]

    def appointment_summary(self, appointment):
        patient_obj = appointment.patient
        patient_user = patient_obj.user if patient_obj else None

        if patient_user:
            patient_public_id = str(patient_user.public_id)
            patient_name = patient_user.get_full_name()
            profile_picture = (
                self.request.build_absolute_uri(patient_user.profile_picture.url)
                if patient_user.profile_picture else None
            )

        elif patient_obj:
            patient_public_id = "User Is guest."
            patient_name = patient_obj.get_full_name()
        else:
            patient_public_id = None
            patient_name = "Unknown"
        return {
            "appointment_public_id": str(appointment.public_id),
            "patient": {
                "public_id": patient_public_id,
                "name": patient_name,
                "profile_picture": profile_picture
            },
            "appointment_type": appointment.appointment_type,
            "resone_for_visit": appointment.reason_for_visit,
            "date": appointment.scheduled_time,
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

        today_appointments = Appointment.objects.filter(Q(
            doctor=doctor_profile, scheduled_time__date=now.date()
            )).exclude(status=Appointment.Status.PENDING)
        
        stats = [
            self.appointment_summary(appt)
            for appt in today_appointments
        ]

        return Response(stats)
        