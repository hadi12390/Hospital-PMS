from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model

from django.urls import reverse


User = get_user_model()


class DoctorAppointmentAPITest(APITestCase):
def setUp(self):

    self.doctor_user = User.objects.create_user(
        email="doctor@test.com",
        username="doctor",
        password="password123",
        role="doctor",
    )

    self.doctor = Doctor.objects.create(
        user=self.doctor_user,
        specialty="Cardiology",
        consultation_duration=30,
        follow_up_duration=15,
        checkup_duration=45,
        start_time=time(9, 0),
        end_time=time(17, 0),
    )


    self.patient_user = User.objects.create_user(
        email="patient@test.com",
        username="patient",
        password="password123",
        role="patient",
    )


    self.patient = Patient.objects.create(
        user=self.patient_user,
        birth_date=date(2000, 1, 1),
    )


    def test_patient_cannot_access_doctor_appointments(self):

        self.client.force_authenticate(
            user=self.patient_user
        )


        response = self.client.get(
            "/appointment/doctor/"
        )


        self.assertEqual(
            response.status_code,
            403
        )