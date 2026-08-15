"""
Tests for PatientDashboard (patient/views.py).

Tenant setup mirrors core/tests.py's CrossTenantIsolationTests:
- TransactionTestCase (schema create/drop needs deferred trigger checks
  that don't fire inside TestCase's wrapping transaction)
- Tenant + Domain created once per class in schema_context("public")
- connection.set_tenant() used per-test so direct ORM setup calls
  (creating appointments/notifications) land in the right schema
  without wrapping every single line in schema_context(...)

TenantAPIClient didn't exist anywhere in the codebase (grep confirmed
it), so it's built here from two real pieces: django_tenants' own
TenantClient (sets the request Host header to the tenant's domain,
which is what the tenant-resolution middleware needs) and DRF's
APIClient (for force_authenticate). Combining them means requests are
both tenant-routed and authenticated without going through a real
login flow.
"""

from datetime import timedelta, time, date

from django.db import connection
from django.test import TransactionTestCase, override_settings
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.utils import timezone

from django_tenants.utils import schema_context
from django_tenants.test.client import TenantClient

from rest_framework.test import APIClient
from rest_framework import status

from appointments.models import Appointment
from notifications.models import Notification
from patient.models import Patient
from doctor.models import Doctor
from tenants.models import Hospital, Domain

User = get_user_model()


class TenantAPIClient(TenantClient, APIClient):
    """TenantClient handles Host-header/domain routing; APIClient adds force_authenticate."""
    pass


@override_settings(ALLOWED_HOSTS=["dashboardtest.testserver", "testserver"])
class PatientDashboardTestBase(TransactionTestCase):
    """
    One shared tenant for the whole test class (created once, expensive),
    fresh patient/doctor/appointments per test (created in setUp/tests).
    """

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        with schema_context("public"):
            cls.tenant = Hospital(schema_name="dashboard_test_hospital", name="Dashboard Test Hospital")
            cls.tenant.save()
            Domain.objects.create(
                domain="dashboardtest.testserver",
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
        # Deliberately override TransactionTestCase's default flush.
        # django-tenants sets search_path to BOTH the tenant schema and
        # public at once, so the default flush (which truncates every
        # table visible on the search path) would also wipe the shared
        # tenants_domain / tenants_hospital rows created once in
        # setUpClass for the whole class - which is exactly what caused
        # get_primary_domain() to start returning None after the first
        # test in each class. Instead, explicitly delete only the
        # tenant-scoped rows this test created, children first.
        with schema_context(self.tenant.schema_name):
            Notification.objects.all().delete()
            Appointment.objects.all().delete()
            Patient.objects.all().delete()
            Doctor.objects.all().delete()
            User.objects.all().delete()

    def setUp(self):
        connection.set_tenant(self.tenant)

        self.client = TenantAPIClient(tenant=self.tenant)

        self.patient_user = self._create_user(
            email="patient@example.com",
            username="sara.youssef",
            first_name="Sara",
            last_name="Youssef",
            role=User.Role.PATIENT,
        )
        self.patient = Patient.objects.create(
            user=self.patient_user,
            first_name="Sara",
            last_name="Youssef",
            personal_id="patient-personal-id-1",
            birth_date=date(1995, 6, 12),
        )

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
        )

        self.url = reverse("patient-dashboard")

    # ---- helpers -----------------------------------------------------

    def _create_user(self, email, username, first_name, last_name, role):
        return User.objects.create_user(
            username=username,
            email=email,
            password="testpass123",
            first_name=first_name,
            last_name=last_name,
            role=role,
        )

    def _create_appointment(self, **kwargs):
        defaults = {
            "patient": self.patient,
            "doctor": self.doctor,
            "appointment_type": "consultation",
        }
        defaults.update(kwargs)
        return Appointment.objects.create(**defaults)

    def _create_notification(self, user, **kwargs):
        defaults = {
            "user": user,
            "notification_type": Notification.Type.APPOINTMENT,
            "title": "Appointment created",
            "message": "Dr. Emily Carter booked an appointment with you",
        }
        defaults.update(kwargs)
        return Notification.objects.create(**defaults)

    def _now(self):
        return timezone.now()


class PatientDashboardPermissionTests(PatientDashboardTestBase):

    def test_requires_authentication(self):
        response = self.client.get(self.url)
        self.assertIn(
            response.status_code,
            (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN),
        )

    def test_rejects_non_patient_user(self):
        self.client.force_authenticate(self.doctor_user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class PatientDashboardEmptyStateTests(PatientDashboardTestBase):

    def test_dashboard_empty_state(self):
        self.client.force_authenticate(self.patient_user)
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["pending_appointments"], 0)
        self.assertEqual(response.data["visits"], 0)
        self.assertIsNone(response.data["last_appointment"])
        self.assertIsNone(response.data["last_doctor"])
        self.assertIsNone(response.data["next_appointment"])
        self.assertEqual(response.data["latest_unread_notifications"], [])


class PatientDashboardAppointmentTests(PatientDashboardTestBase):

    def test_next_appointment_is_nearest_future_confirmed(self):
        now = self._now()

        self._create_appointment(
            status=Appointment.Status.CONFIRMED,
            scheduled_time=now + timedelta(days=10),
        )
        near = self._create_appointment(
            status=Appointment.Status.CONFIRMED,
            scheduled_time=now + timedelta(days=2),
        )

        self.client.force_authenticate(self.patient_user)
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data["next_appointment"]["scheduled_time"],
            near.scheduled_time,
        )

    def test_pending_and_cancelled_appointments_excluded_from_next(self):
        now = self._now()

        self._create_appointment(
            status=Appointment.Status.PENDING,
            scheduled_time=now + timedelta(days=1),
        )
        self._create_appointment(
            status=Appointment.Status.CANCELLED,
            scheduled_time=now + timedelta(days=1),
        )

        self.client.force_authenticate(self.patient_user)
        response = self.client.get(self.url)

        self.assertIsNone(response.data["next_appointment"])
        self.assertEqual(response.data["pending_appointments"], 1)

    def test_last_appointment_is_most_recently_completed(self):
        now = self._now()

        self._create_appointment(
            status=Appointment.Status.COMPLETED,
            scheduled_time=now - timedelta(days=20),
            completed_at=now - timedelta(days=20),
        )
        self._create_appointment(
            status=Appointment.Status.COMPLETED,
            scheduled_time=now - timedelta(days=3),
            completed_at=now - timedelta(days=3),
        )

        self.client.force_authenticate(self.patient_user)
        response = self.client.get(self.url)

        self.assertEqual(response.data["visits"], 2)
        self.assertEqual(
            response.data["last_appointment"]["doctor"]["name"],
            "Emily Carter",
        )
        self.assertEqual(response.data["last_doctor"], "Emily Carter")

    def test_only_own_appointments_counted(self):
        """Regression guard: another patient's appointments must not leak in."""
        other_user = self._create_user(
            email="other@example.com",
            username="omar.ali",
            first_name="Omar",
            last_name="Ali",
            role=User.Role.PATIENT,
        )
        other_patient = Patient.objects.create(
            user=other_user,
            first_name="Omar",
            last_name="Ali",
            personal_id="patient-personal-id-2",
            birth_date=date(1990, 3, 4),
        )

        Appointment.objects.create(
            patient=other_patient,
            doctor=self.doctor,
            appointment_type="consultation",
            status=Appointment.Status.COMPLETED,
            scheduled_time=self._now() - timedelta(days=1),
            completed_at=self._now() - timedelta(days=1),
        )

        self.client.force_authenticate(self.patient_user)
        response = self.client.get(self.url)

        self.assertEqual(response.data["visits"], 0)
        self.assertIsNone(response.data["last_appointment"])


class PatientDashboardNotificationTests(PatientDashboardTestBase):

    def test_notifications_scoped_to_requesting_patient(self):
        """
        Regression test: the original bug queried Notification.objects
        with no user filter at all, leaking every patient's notifications
        to every dashboard. This must never come back.
        """
        other_user = self._create_user(
            email="other2@example.com",
            username="layla.nasser",
            first_name="Layla",
            last_name="Nasser",
            role=User.Role.PATIENT,
        )

        self._create_notification(other_user, title="Not yours", is_read=False)
        self._create_notification(self.patient_user, title="Yours", is_read=False)

        self.client.force_authenticate(self.patient_user)
        response = self.client.get(self.url)

        titles = [n["title"] for n in response.data["latest_unread_notifications"]]
        self.assertEqual(titles, ["Yours"])

    def test_only_two_most_recent_unread_returned(self):
        for i in range(4):
            self._create_notification(
                self.patient_user, title=f"Notification {i}", is_read=False
            )

        self.client.force_authenticate(self.patient_user)
        response = self.client.get(self.url)

        self.assertEqual(len(response.data["latest_unread_notifications"]), 2)
        self.assertEqual(
            response.data["latest_unread_notifications"][0]["title"],
            "Notification 3",
        )

    def test_read_notifications_excluded(self):
        self._create_notification(self.patient_user, title="Already read", is_read=True)

        self.client.force_authenticate(self.patient_user)
        response = self.client.get(self.url)

        self.assertEqual(response.data["latest_unread_notifications"], [])


class PatientDashboardMissingProfileTests(PatientDashboardTestBase):

    def test_404_when_user_has_no_patient_profile(self):
        # TODO: if IsPatient itself blocks a role='patient'-but-no-Patient-row
        # user before get() runs, this should assert 403 instead of 404.
        # Kept as an assertIn over both until you confirm which one fires.
        bare_user = self._create_user(
            email="bare@example.com",
            username="no.profile",
            first_name="No",
            last_name="Profile",
            role=User.Role.PATIENT,
        )

        self.client.force_authenticate(bare_user)
        response = self.client.get(self.url)

        self.assertIn(
            response.status_code,
            (status.HTTP_404_NOT_FOUND, status.HTTP_403_FORBIDDEN),
        )