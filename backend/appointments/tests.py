from datetime import time

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone

from doctor.models import Doctor
from patient.models import Patient

from .models import Appointment


User = get_user_model()


class AppointmentModelTest(TestCase):

    def setUp(self):

        # Create doctor user
        self.doctor_user = User.objects.create_user(
            email="doctor@test.com",
            username="doctor",
            password="password123",
            role="doctor",
        )

        # Create doctor profile
        self.doctor = Doctor.objects.create(
            user=self.doctor_user,
            specialty="Cardiology",

            # Appointment duration defaults
            consultation_duration=30,
            follow_up_duration=15,
            checkup_duration=45,

            # Doctor working hours
            start_time=time(9, 0),
            end_time=time(17, 0),
        )


        # Create patient user
        self.patient_user = User.objects.create_user(
            email="patient@test.com",
            username="patient",
            password="password123",
            role="patient",
        )


        # Create patient profile
        self.patient = Patient.objects.create(
            user=self.patient_user
        )


    def test_create_appointment(self):

        appointment = Appointment.objects.create(
            doctor=self.doctor,
            patient=self.patient,
            scheduled_time=timezone.now(),
            appointment_type=Appointment.AppointmentType.CONSULTATION,
            reason_for_visit="Headache",
        )


        self.assertEqual(
            appointment.status,
            Appointment.Status.PENDING
        )


        self.assertEqual(
            appointment.doctor,
            self.doctor
        )


        self.assertEqual(
            appointment.patient,
            self.patient
        )


    def test_appointment_end_time(self):

        appointment = Appointment.objects.create(
            doctor=self.doctor,
            patient=self.patient,
            scheduled_time=timezone.now(),
            appointment_type=Appointment.AppointmentType.CONSULTATION,
        )


        # Consultation duration should be 30 minutes
        expected_minutes = 30

        difference = (
            appointment.end_time -
            appointment.scheduled_time
        ).seconds // 60


        self.assertEqual(
            difference,
            expected_minutes
        )   