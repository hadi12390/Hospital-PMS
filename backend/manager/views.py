from rest_framework.generics import CreateAPIView, RetrieveUpdateAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import datetime, timedelta
from django.utils import timezone
from django.db.models import Count, Q, F, Prefetch
from django.contrib.auth import get_user_model
from django.db.models import Subquery, OuterRef, Min
import uuid
from django.shortcuts import get_object_or_404

from accounts.permissions import IsManager
from .serializers import AddDoctorSerializer, DoctorOverviewSerializer
from appointments.serializers import ManagerAppointmentSerializer
from appointments.models import Appointment
from doctor.models import Doctor
from logs.models import ActivityLog
from patient.models import Patient

User = get_user_model()
today = timezone.localdate()

class AddDoctor(CreateAPIView):
    serializer_class = AddDoctorSerializer
    permission_classes = [IsManager]


class ManagerAddAppointment(CreateAPIView):
    serializer_class = ManagerAppointmentSerializer
    permission_classes = [IsManager]

class ManagerDashboard(APIView):

    permission_classes = [IsManager]

    def get(self, request):
        now = timezone.localtime(timezone.now())
        now_time = now.time()
        
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
            Q(start_time__lte=F("end_time")) & Q(start_time__lte=now_time, end_time__gte=now_time)
            | Q(start_time__gt=F("end_time")) & (Q(start_time__lte=now_time) | Q(end_time__gte=now_time)),
            user__status=User.Status.ACTIVE,
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
                        "public_id": str(appt.public_id),
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
    

class ManageDoctors(APIView):
    permission_classes = [IsManager]

    def doctor_summary(
        self,
        doctor,
        today_stats_by_doctor=None,
        total_stats_by_doctor=None,
        next_appt_by_doctor=None,
    ):
        if not doctor or not doctor.user:
            return None

        start = doctor.start_time
        end = doctor.end_time

        today_counts = (today_stats_by_doctor or {}).get(doctor.id, {})
        total_counts = (total_stats_by_doctor or {}).get(doctor.id, {})

        appointment_counts = {
            "total": total_counts.get("total", 0),
            "completed": total_counts.get("completed", 0),
            "confirmed": total_counts.get("confirmed", 0),
            "pending": total_counts.get("pending", 0),
            "cancelled": total_counts.get("cancelled", 0),
        }

        # Next appointment for this doctor
        next_appt = (next_appt_by_doctor or {}).get(doctor.id)
        next_appointment = None
        if next_appt:
            next_appointment = {
                "public_id": str(next_appt.public_id),
                "scheduled_time": next_appt.scheduled_time,
                "appointment_type": next_appt.appointment_type,
                "patient": {
                    "public_id": str(next_appt.patient.user.public_id),
                    "name": next_appt.patient.user.get_full_name(),
                }
                if next_appt.patient and next_appt.patient.user
                else None,
            }

        # Guard against incomplete profiles or missing schedule
        if not start or not end:
            return {
                "doctor": {
                    "public_id": str(doctor.user.public_id),
                    "name": doctor.user.get_full_name(),
                },
                "specialty": doctor.specialty,
                "schedule": {"start_time": None, "end_time": None},
                "capacity": 0,
                "status": "Not exist",
                "appointment_counts": appointment_counts,
                "next_appointment": next_appointment,
            }

        # Evaluate active status
        now = timezone.localtime(timezone.now()).time()
        if start <= end:
            is_active = start <= now <= end
        else:
            is_active = now >= start or now <= end

        status = "Active" if is_active else "On Leave"

        # Calculate shift duration
        dummy_date = datetime.today().date()
        start_shift = datetime.combine(dummy_date, start)
        end_shift = datetime.combine(dummy_date, end)

        if end_shift <= start_shift:
            end_shift += timedelta(days=1)

        doctor_shift_minutes = (end_shift - start_shift).total_seconds() / 60

        # Calculate capacity using TODAY's appointment durations
        total_booked_minutes = (
            (today_counts.get("follow_up", 0) * (doctor.follow_up_duration or 0))
            + (today_counts.get("checkups", 0) * (doctor.checkup_duration or 0))
            + (
                today_counts.get("consultations", 0)
                * (doctor.consultation_duration or 0)
            )
        )

        if doctor_shift_minutes > 0 and total_booked_minutes > 0:
            capacity = round((total_booked_minutes / doctor_shift_minutes) * 100)
        else:
            capacity = 0

        return {
            "doctor": {
                "public_id": str(doctor.user.public_id),
                "name": doctor.user.get_full_name(),
                "profile_picture": (
                    self.request.build_absolute_uri(doctor.user.profile_picture.url)
                    if doctor.user and doctor.user.profile_picture
                    else None
                ),
            },
            "specialty": doctor.specialty,
            "schedule": {"start_time": start, "end_time": end},
            "capacity": capacity,
            "status": status,
            "appointment_counts": appointment_counts,
            "next_appointment": next_appointment,
        }

    def get(self, request):
        now_time = timezone.localtime(timezone.now()).time()
        now = timezone.now()
        today = timezone.localdate()

        doctors = Doctor.objects.filter(
            user__status=User.Status.ACTIVE
        ).select_related("user")

        # --- Today's stats (for capacity calculation) ---
        today_appointment_stats = (
            Appointment.objects.filter(scheduled_time__date=today)
            .values("doctor_id")
            .annotate(
                follow_up=Count(
                    "id",
                    filter=Q(
                        appointment_type=Appointment.AppointmentType.FOLLOW_UP,
                        status__in=[
                            Appointment.Status.COMPLETED,
                            Appointment.Status.CONFIRMED,
                            Appointment.Status.PENDING,
                        ],
                    ),
                ),
                checkups=Count(
                    "id",
                    filter=Q(
                        appointment_type=Appointment.AppointmentType.CHECKUP,
                        status__in=[
                            Appointment.Status.COMPLETED,
                            Appointment.Status.CONFIRMED,
                            Appointment.Status.PENDING,
                        ],
                    ),
                ),
                consultations=Count(
                    "id",
                    filter=Q(
                        appointment_type=Appointment.AppointmentType.CONSULTATION,
                        status__in=[
                            Appointment.Status.COMPLETED,
                            Appointment.Status.CONFIRMED,
                            Appointment.Status.PENDING,
                        ],
                    ),
                ),
            )
        )
        today_stats_by_doctor = {
            stat["doctor_id"]: stat for stat in today_appointment_stats
        }

        # --- All-time stats (for appointment_counts totals) ---
        total_appointment_stats = (
            Appointment.objects.values("doctor_id")
            .annotate(
                total=Count("id"),
                completed=Count("id", filter=Q(status=Appointment.Status.COMPLETED)),
                confirmed=Count("id", filter=Q(status=Appointment.Status.CONFIRMED)),
                pending=Count("id", filter=Q(status=Appointment.Status.PENDING)),
                cancelled=Count("id", filter=Q(status=Appointment.Status.CANCELLED)),
            )
        )
        total_stats_by_doctor = {
            stat["doctor_id"]: stat for stat in total_appointment_stats
        }

        # --- Next upcoming appointment per doctor ---
        # Step 1: find the earliest future scheduled_time per doctor
        next_times = (
            Appointment.objects.filter(
                doctor_id=OuterRef("doctor_id"),
                scheduled_time__gte=now,
                status__in=[
                    Appointment.Status.PENDING,
                    Appointment.Status.CONFIRMED,
                ],
            )
            .order_by("scheduled_time")
            .values("scheduled_time")[:1]
        )

        next_appt_ids = (
            Appointment.objects.filter(
                scheduled_time__gte=now,
                status__in=[
                    Appointment.Status.PENDING,
                    Appointment.Status.CONFIRMED,
                ],
            )
            .values("doctor_id")
            .annotate(next_time=Min("scheduled_time"))
        )

        # Map doctor_id -> next_time, then fetch matching appointments in one query
        next_time_by_doctor = {
            row["doctor_id"]: row["next_time"] for row in next_appt_ids
        }

        next_appointments = Appointment.objects.filter(
            status__in=[
                Appointment.Status.PENDING,
                Appointment.Status.CONFIRMED,
            ],
            scheduled_time__in=next_time_by_doctor.values(),
        ).select_related("patient__user")

        next_appt_by_doctor = {}
        for appt in next_appointments:
            # Only keep it if it matches that doctor's actual next_time
            # (guards against two doctors sharing the same scheduled_time)
            if next_time_by_doctor.get(appt.doctor_id) == appt.scheduled_time:
                next_appt_by_doctor[appt.doctor_id] = appt

        # Global doctor counts
        stats = doctors.aggregate(
            total_doctors=Count("id"),
            active_doctors=Count(
                "id",
                filter=Q(start_time__lte=F("end_time"))
                & Q(start_time__lte=now_time, end_time__gte=now_time)
                | Q(start_time__gt=F("end_time"))
                & (Q(start_time__lte=now_time) | Q(end_time__gte=now_time)),
            ),
        )
        stats["on_leave_doctors"] = (
            stats["total_doctors"] - stats["active_doctors"]
        )

        # Build doctor summaries with their specific appointment counts
        summaries = [
            self.doctor_summary(
                doc,
                today_stats_by_doctor,
                total_stats_by_doctor,
                next_appt_by_doctor,
            )
            for doc in doctors
        ]
        stats["doctors"] = summaries

        # Average clinic capacity calculation (based on today's utilization)
        valid_capacities = [
            doc["capacity"] for doc in summaries if doc and "capacity" in doc
        ]
        stats["capacity"] = (
            round(sum(valid_capacities) / len(valid_capacities))
            if valid_capacities
            else 0
        )

        return Response(stats)

class ManageAppointments(APIView):
    permission_classes = [IsManager]

    def appointment_summary(self, appointment):
        patient_obj = appointment.patient
        patient_user = patient_obj.user if patient_obj else None

        if patient_user:
            patient_public_id = str(patient_user.public_id)
            patient_name = patient_user.get_full_name()
            patient_phone_number = patient_obj.phone_number
        elif patient_obj:
            patient_public_id = "User Is guest."
            patient_name = patient_obj.get_full_name()
            patient_phone_number = patient_obj.phone_number

        else:
            patient_public_id = None
            patient_name = "Unknown"

        doctor_user = getattr(appointment.doctor, "user", None) if appointment.doctor else None
        doctor_public_id = str(doctor_user.public_id) if doctor_user else None
        doctor_name = doctor_user.get_full_name() if doctor_user else "Unassigned"

        return {
            "appointment_public_id": str(appointment.public_id),
            "patient": {
                "public_id": patient_public_id,
                "name": patient_name,
                "patient_phone_number": patient_phone_number,
            },
            "doctor": {
                "public_id": doctor_public_id,
                "name": doctor_name,
            },
            "appointment_type": appointment.appointment_type,
            "date": appointment.scheduled_time,
            "status": appointment.status,
        }

    def get(self, request):
        appointments = Appointment.objects.all().select_related("patient__user", "doctor__user")

        stats = appointments.aggregate(
            total_appointments=Count("id"),
            cancelled_appointments=Count("id", filter=Q(status=Appointment.Status.CANCELLED)),
            pending_appointments=Count("id", filter=Q(status=Appointment.Status.PENDING)),
            completed_appointments=Count("id", filter=Q(status=Appointment.Status.COMPLETED)),
            confirmed_appointments=Count("id", filter=Q(status=Appointment.Status.CONFIRMED)),
            no_show_appointments=Count("id", filter=Q(status=Appointment.Status.NO_SHOW)),
        )

        stats["appointments"] = [
            self.appointment_summary(app)
            for app in appointments
        ]

        return Response(stats)

class ManagePatients(APIView):
    permission_classes = [IsManager]

    def patient_summary(self, patient, last_appointment, next_appointment):
        today = timezone.now().date()

        if patient and getattr(patient, 'user', None):
            patient_public_id = str(patient.user.public_id)
            patient_name = patient.user.get_full_name()
            profile_picture = (
                self.context['request'].build_absolute_uri(patient.user.profile_picture.url)
                if patient.user.profile_picture else None
            ),
        elif patient:
            patient_public_id = "User Is guest."
            patient_name = f"{patient.first_name} {patient.last_name}"
            profile_picture = None

        else:
            patient_public_id = None
            patient_name = "Unknown"
            profile_picture = None

        if last_appointment:
            last_appointment_public_id = str(last_appointment.public_id)
            last_appointment_date = last_appointment.scheduled_time
            last_appointment_doctor = last_appointment.doctor.user.get_full_name()
            last_appointment_doctor_public_id = str(last_appointment.doctor.user.public_id)
        else:
            last_appointment_public_id = None
            last_appointment_date = None
            last_appointment_doctor = None
            last_appointment_doctor_public_id = None

        if next_appointment:
            next_appointment_public_id = str(next_appointment.public_id)
            next_appointment_date = next_appointment.scheduled_time
            next_appointment_doctor = next_appointment.doctor.user.get_full_name()
            next_appointment_doctor_public_id = str(next_appointment.doctor.user.public_id)
        else:
            next_appointment_public_id = None
            next_appointment_date = None
            next_appointment_doctor = None
            next_appointment_doctor_public_id = None

        phone_number = getattr(patient, 'phone_number', None)
        birth_date = getattr(patient, 'birth_date', None)

        age = None
        if birth_date:
            age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))

        return {
            "patient": {
                "public_id": patient_public_id,
                "name": patient_name,
                'profile_picture': profile_picture
            },
            "phone": phone_number,
            "appointment_counts": {
                "total": getattr(patient, "total_appointments_count", 0),
                "completed": getattr(patient, "completed_appointments_count", 0),
                "confirmed": getattr(patient, "confirmed_appointments_count", 0),
                "cancelled": getattr(patient, "cancelled_appointments_count", 0),
            },
            "last_appointment": {
                "appointment_public_id": last_appointment_public_id,
                "appointment_date": last_appointment_date,
                "doctor_name": last_appointment_doctor,
                "doctor_public_id": last_appointment_doctor_public_id
            },
            "next_appointment": {
                "appointment_public_id": next_appointment_public_id,
                "appointment_date": next_appointment_date,
                "doctor_name": next_appointment_doctor,
                "doctor_public_id": next_appointment_doctor_public_id
            },
            "birth_date": birth_date,
            "age": age
        }

    def get(self, request):
        today = timezone.now().date()

        # 1. Aggregate global stats across all appointments
        stats = Patient.objects.annotate(
            first_appointment=Min("appointments__scheduled_time")
        ).aggregate(
            total_patients=Count("id", distinct=True),
            new_patients_count=Count(
                "id",
                distinct=True,
                filter=Q(
                    first_appointment__year=today.year,
                    first_appointment__month=today.month
                )
            ),
            total_appointments=Count("appointments__id"),
            completed_appointments=Count(
                "appointments__id",
                filter=Q(appointments__status=Appointment.Status.COMPLETED)
            ),
            confirmed_appointments=Count(
                "appointments__id",
                filter=Q(appointments__status=Appointment.Status.CONFIRMED)
            ),
            cancelled_appointments=Count(
                "appointments__id",
                filter=Q(appointments__status=Appointment.Status.CANCELLED)
            ),
        )

        # 2. Querysets for prefetching single appointments
        latest_appointments = Appointment.objects.filter(
            status=Appointment.Status.COMPLETED
        ).order_by('-scheduled_time').select_related("doctor__user")

        next_appointments = Appointment.objects.filter(
            status=Appointment.Status.CONFIRMED,
            scheduled_time__gte=timezone.now()
        ).order_by('scheduled_time').select_related("doctor__user")

        # 3. Fetch patients with conditional annotations per patient and prefetches
        patients = Patient.objects.select_related('user').annotate(
            total_appointments_count=Count("appointments__id"),
            completed_appointments_count=Count(
                "appointments__id",
                filter=Q(appointments__status=Appointment.Status.COMPLETED)
            ),
            confirmed_appointments_count=Count(
                "appointments__id",
                filter=Q(appointments__status=Appointment.Status.CONFIRMED)
            ),
            cancelled_appointments_count=Count(
                "appointments__id",
                filter=Q(appointments__status=Appointment.Status.CANCELLED)
            ),
        ).prefetch_related(
            Prefetch(
                'appointments',
                queryset=latest_appointments,
                to_attr='latest_appointments_list'
            ),
            Prefetch(
                'appointments',
                queryset=next_appointments,
                to_attr='next_appointments_list'
            )
        )

        # 4. Build summarized list
        patient_summaries = []
        for patient in patients:
            last_appt = patient.latest_appointments_list[0] if patient.latest_appointments_list else None
            next_appt = patient.next_appointments_list[0] if patient.next_appointments_list else None

            patient_summaries.append(
                self.patient_summary(patient, last_appt, next_appt)
            )

        # 5. Final payload
        response_data = {
            "stats": stats,
            "patients": patient_summaries
        }

        return Response(response_data)

class DoctorOverView(RetrieveUpdateAPIView):
    permission_classes = [IsManager]
    serializer_class = DoctorOverviewSerializer

    def get_object(self):
        public_id = self.kwargs["public_id"]

        return get_object_or_404(
            Doctor.objects.select_related("user"),
            user__public_id=public_id,
        )