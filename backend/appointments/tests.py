from datetime import time

from django.contrib.auth import get_user_model
from django_tenants.test.cases import TenantTestCase
from rest_framework.test import APIRequestFactory, force_authenticate
from rest_framework import status

from patient.models import Patient
from doctor.models import Doctor
from appointments.views import PatientListCreateAppointment

User = get_user_model()


class PatientAppointmentTypeRestrictionTests(TenantTestCase):
    def setUp(self):
        # --- a patient user + profile ---
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

        # --- a doctor user + profile, so we have someone to book with ---
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

        self.factory = APIRequestFactory()

    def test_patient_cannot_book_follow_up(self):
        request = self.factory.post("/appointment/", {
            "doctor": str(self.doctor_user.public_id),
            "scheduled_time": "2026-09-01T10:00:00Z",
            "reason_for_visit": "test",
            "appointment_type": "follow_up",
        })
        force_authenticate(request, user=self.patient_user)

        response = PatientListCreateAppointment.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("appointment_type", response.data)