# from rest_framework.test import APITestCase
# from django.contrib.auth import get_user_model

# from django.urls import reverse


# User = get_user_model()


# class DoctorAppointmentAPITest(APITestCase):
#     def setUp(self):

#         self.doctor_user = User.objects.create_user(
#             email="doctor@test.com",
#             username="doctor",
#             password="password123",
#             role="doctor",
#         )

#         self.doctor = Doctor.objects.create(
#             user=self.doctor_user,
#             specialty="Cardiology",
#             consultation_duration=30,
#             follow_up_duration=15,
#             checkup_duration=45,
#             start_time=time(9, 0),
#             end_time=time(17, 0),
#         )


#         self.patient_user = User.objects.create_user(
#             email="patient@test.com",
#             username="patient",
#             password="password123",
#             role="patient",
#         )


#         self.patient = Patient.objects.create(
#             user=self.patient_user,
#             birth_date=date(2000, 1, 1),
#         )


#     def test_patient_cannot_access_doctor_appointments(self):

#         self.client.force_authenticate(
#             user=self.patient_user
#         )


#         response = self.client.get(
#             "/appointment/doctor/"
#         )


#         self.assertEqual(
#             response.status_code,
#             403
#         )

"""
Tests for DoctorProfileEditView (doctor/views.py).

Tenant setup mirrors patient/tests.py's PatientDashboardTestBase -
same TenantAPIClient, same Hospital/Domain creation, same
_fixture_teardown override (avoids TransactionTestCase's default
flush wiping shared tenant/domain rows via django-tenants' combined
search_path - see patient/tests.py for the full explanation), same
ALLOWED_HOSTS override for the fake test domain.

If you've since moved that infra into a shared base class/module,
swap these imports to use it instead of the duplicated version below.
"""

from datetime import time

from django.db import connection
from django.test import TransactionTestCase, override_settings
from django.urls import reverse
from django.contrib.auth import get_user_model

from django_tenants.utils import schema_context
from django_tenants.test.client import TenantClient

from rest_framework.test import APIClient
from rest_framework import status

from doctor.models import Doctor
from patient.models import Patient
from tenants.models import Hospital, Domain

User = get_user_model()


class TenantAPIClient(TenantClient, APIClient):
    pass


@override_settings(ALLOWED_HOSTS=["doctorprofiletest.testserver", "testserver"])
class DoctorProfileTestBase(TransactionTestCase):

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        with schema_context("public"):
            cls.tenant = Hospital(schema_name="doctor_profile_test_hospital", name="Doctor Profile Test Hospital")
            cls.tenant.save()
            Domain.objects.create(
                domain="doctorprofiletest.testserver",
                tenant=cls.tenant,
                is_primary=True,
            )

    @classmethod
    def tearDownClass(cls):
        connection.set_schema_to_public()
        with schema_context("public"):
            cls.tenant.delete(force_drop=True)
        super().tearDownClass()

    def _fixture_teardown(self):
        with schema_context(self.tenant.schema_name):
            Doctor.objects.all().delete()
            Patient.objects.all().delete()
            User.objects.all().delete()

    def setUp(self):
        connection.set_tenant(self.tenant)

        self.client = TenantAPIClient(tenant=self.tenant)

        self.doctor_user = self._create_user(
            email="doctor@example.com",
            username="emily.carter",
            first_name="Emily",
            last_name="Carter",
            role=User.Role.DOCTOR,
        )
        self.doctor = Doctor.objects.create(
            user=self.doctor_user,
            specialty="Cardiology",
            consultation_duration=30,
            follow_up_duration=15,
            checkup_duration=45,
            start_time=time(9, 0),
            end_time=time(17, 0),
            # TODO: confirm phone_number's real field type/validation on
            # Doctor - swap this for a valid value if it fails.
            phone_number="0791234567",
        )

        self.patient_user = self._create_user(
            email="patient@example.com",
            username="sara.youssef",
            first_name="Sara",
            last_name="Youssef",
            role=User.Role.PATIENT,
        )

        self.url = reverse("doctor=profile")

    def _create_user(self, email, username, first_name, last_name, role):
        return User.objects.create_user(
            username=username,
            email=email,
            password="testpass123",
            first_name=first_name,
            last_name=last_name,
            role=role,
        )


class DoctorProfilePermissionTests(DoctorProfileTestBase):

    def test_requires_authentication(self):
        response = self.client.get(self.url)
        self.assertIn(
            response.status_code,
            (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN),
        )

    def test_rejects_non_doctor_user(self):
        self.client.force_authenticate(self.patient_user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class DoctorProfileRetrieveTests(DoctorProfileTestBase):

    def test_get_returns_own_profile(self):
        self.client.force_authenticate(self.doctor_user)
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["first_name"], "Emily")
        self.assertEqual(response.data["last_name"], "Carter")
        self.assertEqual(response.data["specialty"], "Cardiology")
        self.assertEqual(response.data["consultation_duration"], 30)
        self.assertEqual(response.data["follow_up_duration"], 15)
        self.assertEqual(response.data["checkup_duration"], 45)


class DoctorProfileUpdateTests(DoctorProfileTestBase):

    def test_can_update_writable_fields(self):
        self.client.force_authenticate(self.doctor_user)
        response = self.client.patch(
            self.url,
            {
                "consultation_duration": 40,
                "follow_up_duration": 20,
                "checkup_duration": 50,
                "phone_number": "0797654321",
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.doctor.refresh_from_db()
        self.assertEqual(self.doctor.consultation_duration, 40)
        self.assertEqual(self.doctor.follow_up_duration, 20)
        self.assertEqual(self.doctor.checkup_duration, 50)
        self.assertEqual(self.doctor.phone_number, "0797654321")

    def test_cannot_change_specialty(self):
        """specialty is in read_only_fields - a PATCH attempt must be silently ignored, not error."""
        self.client.force_authenticate(self.doctor_user)
        response = self.client.patch(self.url, {"specialty": "Dermatology"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.doctor.refresh_from_db()
        self.assertEqual(self.doctor.specialty, "Cardiology")

    def test_cannot_change_start_end_time(self):
        self.client.force_authenticate(self.doctor_user)
        response = self.client.patch(
            self.url,
            {"start_time": "07:00:00", "end_time": "19:00:00"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.doctor.refresh_from_db()
        self.assertEqual(self.doctor.start_time, time(9, 0))
        self.assertEqual(self.doctor.end_time, time(17, 0))

    def test_cannot_change_name_via_dotted_source_fields(self):
        """
        Regression test: first_name/last_name are explicitly declared
        CharFields with source='user.first_name' / 'user.last_name' and
        read_only=True. Confirms the earlier AssertionError
        ("update() does not support writable dotted-source fields")
        stays fixed - a PATCH here should succeed and leave the name
        untouched, not 500.
        """
        self.client.force_authenticate(self.doctor_user)
        response = self.client.patch(
            self.url,
            {"first_name": "Someone", "last_name": "Else"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.doctor_user.refresh_from_db()
        self.assertEqual(self.doctor_user.first_name, "Emily")
        self.assertEqual(self.doctor_user.last_name, "Carter")

    def test_update_does_not_affect_other_doctor(self):
        other_user = self._create_user(
            email="other@example.com",
            username="omar.doctor",
            first_name="Omar",
            last_name="Hassan",
            role=User.Role.DOCTOR,
        )
        other_doctor = Doctor.objects.create(
            user=other_user,
            specialty="Neurology",
            consultation_duration=30,
            follow_up_duration=15,
            checkup_duration=45,
            start_time=time(9, 0),
            end_time=time(17, 0),
            phone_number="0790000000",
        )

        self.client.force_authenticate(self.doctor_user)
        self.client.patch(self.url, {"consultation_duration": 99})

        other_doctor.refresh_from_db()
        self.assertEqual(other_doctor.consultation_duration, 30)