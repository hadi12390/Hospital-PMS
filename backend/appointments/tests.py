# from datetime import time

# from django.contrib.auth import get_user_model
# from django_tenants.test.cases import TenantTestCase
# from rest_framework.test import APIRequestFactory, force_authenticate
# from rest_framework import status

# from patient.models import Patient
# from doctor.models import Doctor
# from appointments.views import PatientListCreateAppointment

# User = get_user_model()


# class PatientAppointmentTypeRestrictionTests(TenantTestCase):
#     def setUp(self):
#         # --- a patient user + profile ---
#         self.patient_user = User.objects.create_user(
#             username="patient1",
#             email="patient1@test.com",
#             password="pass1234",
#             role="patient",
#         )
#         self.patient = Patient.objects.create(
#             user=self.patient_user,
#             first_name="Test",
#             last_name="Patient",
#             birth_date="1990-01-01",
#         )

#         # --- a doctor user + profile, so we have someone to book with ---
#         self.doctor_user = User.objects.create_user(
#             username="doctor1",
#             email="doctor1@test.com",
#             password="pass1234",
#             role="doctor",
#         )
#         self.doctor = Doctor.objects.create(
#             user=self.doctor_user,
#             specialty="General",
#             start_time=time(9, 0),
#             end_time=time(17, 0),
#         )

#         self.factory = APIRequestFactory()

#     def test_patient_cannot_book_follow_up(self):
#         request = self.factory.post("/appointment/", {
#             "doctor": str(self.doctor_user.public_id),
#             "scheduled_time": "2026-09-01T10:00:00Z",
#             "reason_for_visit": "test",
#             "appointment_type": "follow_up",
#         })
#         force_authenticate(request, user=self.patient_user)

#         response = PatientListCreateAppointment.as_view()(request)

#         self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
#         self.assertIn("appointment_type", response.data)

# from datetime import time, timedelta

# from django.contrib.auth import get_user_model
# from django.utils import timezone
# from django_tenants.test.cases import TenantTestCase
# from rest_framework.test import APIRequestFactory, force_authenticate
# from rest_framework import status

# from patient.models import Patient
# from doctor.models import Doctor
# from appointments.models import Appointment
# from appointments.views import AvailableTimesView

# User = get_user_model()


# class AvailableTimesViewTests(TenantTestCase):
#     def setUp(self):
#         self.patient_user = User.objects.create_user(
#             username="patient1",
#             email="patient1@test.com",
#             password="pass1234",
#             role="patient",
#         )
#         self.patient = Patient.objects.create(
#             user=self.patient_user,
#             first_name="Test",
#             last_name="Patient",
#             birth_date="1990-01-01",
#         )

#         self.doctor_user = User.objects.create_user(
#             username="doctor1",
#             email="doctor1@test.com",
#             password="pass1234",
#             role="doctor",
#         )
#         self.doctor = Doctor.objects.create(
#             user=self.doctor_user,
#             specialty="General",
#             start_time=time(9, 0),
#             end_time=time(17, 0),
#         )

#         self.factory = APIRequestFactory()

#         # tomorrow, so we don't have to think about "already in the past" filtering
#         self.test_date = (timezone.now() + timedelta(days=1)).date()

#     def call_view(self, date_str, doctor_public_id, appointment_type):
#         url = (
#             f"/appointment/available-times/"
#             f"?date={date_str}&doctor={doctor_public_id}&type={appointment_type}"
#         )
#         request = self.factory.get(url)
#         force_authenticate(request, user=self.patient_user)
#         return AvailableTimesView.as_view()(request)

#     def test_returns_times_when_doctor_has_no_appointments(self):
#         response = self.call_view(
#             self.test_date, self.doctor_user.public_id, "consultation"
#         )
#         self.assertEqual(response.status_code, status.HTTP_200_OK)
#         self.assertTrue(len(response.data) > 0)
#         # doctor works 9-17 (8 hours), consultation is 30 min -> 16 possible slots
#         self.assertEqual(len(response.data), 16)

#     def test_missing_date_returns_400(self):
#         response = self.call_view("", self.doctor_user.public_id, "consultation")
#         self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

#     def test_invalid_doctor_id_returns_400(self):
#         response = self.call_view(self.test_date, "not-a-uuid", "consultation")
#         self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

#     def test_nonexistent_doctor_returns_404(self):
#         fake_id = "00000000-0000-0000-0000-000000000000"
#         response = self.call_view(self.test_date, fake_id, "consultation")
#         self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

#     def test_invalid_type_returns_400(self):
#         response = self.call_view(
#             self.test_date, self.doctor_user.public_id, "banana"
#         )
#         self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

#     def test_booked_slot_is_excluded(self):
#         booked_time = timezone.make_aware(
#             timezone.datetime.combine(self.test_date, time(9, 0))
#         )
#         Appointment.objects.create(
#             doctor=self.doctor,
#             patient=self.patient,
#             scheduled_time=booked_time,
#             appointment_type=Appointment.AppointmentType.CONSULTATION,
#             duration_minutes=30,
#             status=Appointment.Status.CONFIRMED,
#         )

#         response = self.call_view(
#             self.test_date, self.doctor_user.public_id, "consultation"
#         )
#         self.assertEqual(response.status_code, status.HTTP_200_OK)

#         returned_times = [slot["time"] for slot in response.data]
#         self.assertNotIn(booked_time, returned_times)
#         # one less slot than the no-conflict case (16 - 1 = 15)
#         self.assertEqual(len(response.data), 15)

from datetime import time, timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone

from django_tenants.test.cases import TenantTestCase

from rest_framework import status
from rest_framework.test import APIRequestFactory, force_authenticate

from patient.models import Patient
from doctor.models import Doctor
from appointments.models import Appointment
from appointments.views import AppointmentCancelView


User = get_user_model()


class AppointmentCancelTests(TenantTestCase):

    def setUp(self):
        # =================================================
        # Patient 1
        # =================================================

        self.patient_user = User.objects.create_user(
            username="patient1",
            email="patient1@test.com",
            password="pass1234",
            role="patient",
        )

        self.patient = Patient.objects.create(
            user=self.patient_user,
            first_name="Test",
            last_name="Patient",
            birth_date="1990-01-01",
        )

        # =================================================
        # Patient 2
        # =================================================

        self.other_patient_user = User.objects.create_user(
            username="patient2",
            email="patient2@test.com",
            password="pass1234",
            role="patient",
        )

        self.other_patient = Patient.objects.create(
            user=self.other_patient_user,
            first_name="Other",
            last_name="Patient",
            birth_date="1990-01-01",
        )

        # =================================================
        # Doctor
        # =================================================

        self.doctor_user = User.objects.create_user(
            username="doctor1",
            email="doctor1@test.com",
            password="pass1234",
            role="doctor",
        )

        self.doctor = Doctor.objects.create(
            user=self.doctor_user,
            specialty="General",
            start_time=time(9, 0),
            end_time=time(17, 0),
        )

        # =================================================
        # Appointment belonging to patient 1
        # =================================================

        self.appointment = Appointment.objects.create(
            doctor=self.doctor,
            patient=self.patient,
            scheduled_time=timezone.now() + timedelta(days=1),
            appointment_type=Appointment.AppointmentType.CONSULTATION,
            duration_minutes=30,
            status=Appointment.Status.PENDING,
        )

        # =================================================
        # Appointment belonging to patient 2
        # =================================================

        self.other_appointment = Appointment.objects.create(
            doctor=self.doctor,
            patient=self.other_patient,
            scheduled_time=timezone.now() + timedelta(days=2),
            appointment_type=Appointment.AppointmentType.CONSULTATION,
            duration_minutes=30,
            status=Appointment.Status.PENDING,
        )

        self.factory = APIRequestFactory()

    def call_cancel(self, appointment, user=None):
        """
        Builds a PATCH request to cancel the given appointment and calls
        the view directly (skipping URL routing/middleware, same reason
        as in the other test files: TenantMainMiddleware needs a real
        domain match, which a plain test request doesn't have).
        """
        request = self.factory.patch(
            f"/appointment/{appointment.public_id}/cancel/",
            {"status": Appointment.Status.CANCELLED},
            format="json",
        )
        if user is not None:
            force_authenticate(request, user=user)

        return AppointmentCancelView.as_view()(
            request, public_id=appointment.public_id
        )

    # =====================================================
    # 1. Patient can cancel their own appointment
    # =====================================================

    def test_patient_can_cancel_own_appointment(self):
        response = self.call_cancel(self.appointment, user=self.patient_user)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.appointment.refresh_from_db()

        self.assertEqual(self.appointment.status, Appointment.Status.CANCELLED)
        self.assertIsNotNone(self.appointment.cancelled_at)

    # =====================================================
    # 2. Patient cannot cancel another patient's appointment
    # =====================================================

    def test_patient_cannot_cancel_other_patient_appointment(self):
        response = self.call_cancel(self.other_appointment, user=self.patient_user)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        self.other_appointment.refresh_from_db()

        self.assertEqual(self.other_appointment.status, Appointment.Status.PENDING)
        self.assertIsNone(self.other_appointment.cancelled_at)

    # =====================================================
    # 3. Patient cannot change status to completed
    # =====================================================

    def test_patient_cannot_set_status_to_completed(self):
        request = self.factory.patch(
            f"/appointment/{self.appointment.public_id}/cancel/",
            {"status": Appointment.Status.COMPLETED},
            format="json",
        )
        force_authenticate(request, user=self.patient_user)
        response = AppointmentCancelView.as_view()(
            request, public_id=self.appointment.public_id
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.appointment.refresh_from_db()

        self.assertEqual(self.appointment.status, Appointment.Status.PENDING)
        self.assertIsNone(self.appointment.cancelled_at)

    # =====================================================
    # 4. Cancelling sets cancelled_at
    # =====================================================

    def test_cancelling_sets_cancelled_at(self):
        before = timezone.now()
        response = self.call_cancel(self.appointment, user=self.patient_user)
        after = timezone.now()

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.appointment.refresh_from_db()

        self.assertIsNotNone(self.appointment.cancelled_at)
        self.assertGreaterEqual(self.appointment.cancelled_at, before)
        self.assertLessEqual(self.appointment.cancelled_at, after)

    # =====================================================
    # 5. Unauthenticated user cannot cancel
    # =====================================================

    def test_unauthenticated_user_cannot_cancel(self):
        response = self.call_cancel(self.appointment, user=None)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # =====================================================
    # 6. Endpoint uses public_id
    # =====================================================

    def test_cancel_uses_public_id(self):
        response = self.call_cancel(self.appointment, user=self.patient_user)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.appointment.refresh_from_db()

        self.assertEqual(self.appointment.status, Appointment.Status.CANCELLED)