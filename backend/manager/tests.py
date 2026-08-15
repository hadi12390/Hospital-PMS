"""
Tests for ManagerDashboard (manager/views.py).

Tenant setup mirrors patient/tests.py's PatientDashboardTestBase.
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
from patient.models import Patient
from doctor.models import Doctor
from manager.models import Manager
from logs.models import ActivityLog
from tenants.models import Hospital, Domain

User = get_user_model()


class TenantAPIClient(TenantClient, APIClient):
    pass


@override_settings(ALLOWED_HOSTS=["managerdashboardtest.testserver", "testserver"])
class ManagerDashboardTestBase(TransactionTestCase):

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        with schema_context("public"):
            cls.tenant = Hospital(
                schema_name="manager_dashboard_test_hospital",
                name="Manager Dashboard Test Hospital",
            )
            cls.tenant.save()
            Domain.objects.create(
                domain="managerdashboardtest.testserver",
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
            ActivityLog.objects.all().delete()
            Appointment.objects.all().delete()
            Patient.objects.all().delete()
            Doctor.objects.all().delete()
            Manager.objects.all().delete()
            User.objects.all().delete()

    def setUp(self):
        connection.set_tenant(self.tenant)
        self.client = TenantAPIClient(tenant=self.tenant)

        self.manager_user = self._create_user(
            email="manager@example.com",
            username="rana.khalil",
            first_name="Rana",
            last_name="Khalil",
            role=User.Role.MANAGER,
        )
        self.manager = Manager.objects.create(
            user=self.manager_user,
            title="Head of Operations",
            department="Front Desk",
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

        self.url = reverse("manager-dashboard")

    # ---- helpers -----------------------------------------------------

    def _create_user(self, email, username, first_name, last_name, role, status=None):
        user = User.objects.create_user(
            username=username,
            email=email,
            password="testpass123",
            first_name=first_name,
            last_name=last_name,
            role=role,
        )
        if status:
            user.status = status
            user.save(update_fields=["status"])
        return user

    def _create_appointment(self, **kwargs):
        defaults = {
            "patient": self.patient,
            "doctor": self.doctor,
            "appointment_type": "consultation",
            "scheduled_time": timezone.now(),
        }
        defaults.update(kwargs)
        return Appointment.objects.create(**defaults)

    def _create_guest_patient(self, personal_id="guest-1", first_name="Guest", last_name="Person"):
        """Patient with no linked User account (walk-in/visitor case)."""
        return Patient.objects.create(
            user=None,
            first_name=first_name,
            last_name=last_name,
            personal_id=personal_id,
            birth_date=date(1988, 1, 1),
        )

    def _create_log(self, **kwargs):
        defaults = {
            "user": self.manager_user,
            "action": ActivityLog.Action.REGISTER,
            "description": "test log entry",
        }
        defaults.update(kwargs)
        return ActivityLog.objects.create(**defaults)

    def _now(self):
        return timezone.now()


class ManagerDashboardPermissionTests(ManagerDashboardTestBase):

    def test_requires_authentication(self):
        response = self.client.get(self.url)
        self.assertIn(
            response.status_code,
            (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN),
        )

    def test_rejects_non_manager_user(self):
        self.client.force_authenticate(self.doctor_user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_404_when_manager_profile_missing(self):
        bare_user = self._create_user(
            email="bare@example.com",
            username="no.profile",
            first_name="No",
            last_name="Profile",
            role=User.Role.MANAGER,
        )
        self.client.force_authenticate(bare_user)
        response = self.client.get(self.url)
        self.assertIn(
            response.status_code,
            (status.HTTP_404_NOT_FOUND, status.HTTP_403_FORBIDDEN),
        )


class ManagerDashboardAppointmentTests(ManagerDashboardTestBase):

    def test_only_appointments_completed_today_are_counted(self):
        now = self._now()

        self._create_appointment(
            status=Appointment.Status.COMPLETED,
            completed_at=now,
        )
        self._create_appointment(
            status=Appointment.Status.COMPLETED,
            completed_at=now - timedelta(days=2),
        )

        self.client.force_authenticate(self.manager_user)
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["today"]["appointments_count"], 1)

    def test_last_three_returns_three_most_recently_completed(self):
        now = self._now()

        for i in range(5):
            self._create_appointment(
                status=Appointment.Status.COMPLETED,
                completed_at=now - timedelta(minutes=i),
            )

        self.client.force_authenticate(self.manager_user)
        response = self.client.get(self.url)

        self.assertEqual(len(response.data["today"]["last_three"]), 3)
        returned_times = [
            entry["completed_at"] for entry in response.data["today"]["last_three"]
        ]
        self.assertEqual(returned_times, sorted(returned_times, reverse=True))

    def test_patients_without_user_excluded_from_list_but_counted(self):
        now = self._now()
        guest = self._create_guest_patient()

        self._create_appointment(
            patient=self.patient,
            status=Appointment.Status.COMPLETED,
            completed_at=now,
        )
        self._create_appointment(
            patient=guest,
            status=Appointment.Status.COMPLETED,
            completed_at=now,
        )

        self.client.force_authenticate(self.manager_user)
        response = self.client.get(self.url)

        self.assertEqual(response.data["today"]["appointments_count"], 2)
        # only patients with a linked user show up by name
        self.assertEqual(response.data["today"]["patients"], ["Sara Youssef"])
        # but patients_count reflects ALL distinct patients today, named or not
        self.assertEqual(response.data["today"]["patients_count"], 2)

    def test_appointment_with_no_patient_still_counted_but_not_in_patients(self):
        now = self._now()

        self._create_appointment(
            patient=None,
            status=Appointment.Status.COMPLETED,
            completed_at=now,
        )

        self.client.force_authenticate(self.manager_user)
        response = self.client.get(self.url)

        self.assertEqual(response.data["today"]["appointments_count"], 1)
        self.assertEqual(response.data["today"]["patients"], [])
        # patient_id is None here, and {None} still has length 1
        self.assertEqual(response.data["today"]["patients_count"], 1)


class ManagerDashboardDoctorTests(ManagerDashboardTestBase):

    def test_doctor_within_shift_and_active_is_counted(self):
        now = self._now()
        self.doctor.start_time = (now - timedelta(hours=1)).time()
        self.doctor.end_time = (now + timedelta(hours=1)).time()
        self.doctor.save()

        self.client.force_authenticate(self.manager_user)
        response = self.client.get(self.url)

        self.assertEqual(response.data["doctors"]["active_count"], 1)

    def test_doctor_outside_shift_hours_excluded(self):
        now = self._now()
        self.doctor.start_time = (now + timedelta(hours=1)).time()
        self.doctor.end_time = (now + timedelta(hours=2)).time()
        self.doctor.save()

        self.client.force_authenticate(self.manager_user)
        response = self.client.get(self.url)

        self.assertEqual(response.data["doctors"]["active_count"], 0)

    def test_disabled_doctor_excluded_even_within_shift(self):
        now = self._now()
        self.doctor.start_time = (now - timedelta(hours=1)).time()
        self.doctor.end_time = (now + timedelta(hours=1)).time()
        self.doctor.save()

        self.doctor_user.status = User.Status.DISABLED
        self.doctor_user.save(update_fields=["status"])

        self.client.force_authenticate(self.manager_user)
        response = self.client.get(self.url)

        self.assertEqual(response.data["doctors"]["active_count"], 0)


class ManagerDashboardAppointmentStatusTests(ManagerDashboardTestBase):

    def test_appointment_status_breakdown(self):
        now = self._now()

        self._create_appointment(status=Appointment.Status.PENDING)
        self._create_appointment(status=Appointment.Status.CANCELLED)
        self._create_appointment(status=Appointment.Status.CANCELLED)
        self._create_appointment(status=Appointment.Status.CONFIRMED)
        self._create_appointment(
            status=Appointment.Status.COMPLETED, completed_at=now
        )
        self._create_appointment(
            status=Appointment.Status.COMPLETED, completed_at=now
        )
        self._create_appointment(
            status=Appointment.Status.COMPLETED, completed_at=now
        )

        self.client.force_authenticate(self.manager_user)
        response = self.client.get(self.url)

        breakdown = response.data["appointments_by_status"]
        self.assertEqual(breakdown["pending_appointments"], 1)
        self.assertEqual(breakdown["cancelled_appointments"], 2)
        self.assertEqual(breakdown["confirmed_appointments"], 1)
        self.assertEqual(breakdown["completed_appointments"], 3)

    def test_status_breakdown_not_scoped_to_today(self):
        """
        appointment_status aggregates over `appointments` (all-time), not
        `today_appointments` - locked in on purpose per earlier decision.
        If that assumption changes, this test should change with it.
        """
        old_time = self._now() - timedelta(days=30)

        self._create_appointment(
            status=Appointment.Status.COMPLETED, completed_at=old_time
        )

        self.client.force_authenticate(self.manager_user)
        response = self.client.get(self.url)

        self.assertEqual(
            response.data["appointments_by_status"]["completed_appointments"], 1
        )
        self.assertEqual(response.data["today"]["appointments_count"], 0)


class ManagerDashboardRecentActivityTests(ManagerDashboardTestBase):

    def test_returns_at_most_four_logs(self):
        for i in range(6):
            self._create_log(description=f"log {i}")

        self.client.force_authenticate(self.manager_user)
        response = self.client.get(self.url)

        self.assertEqual(len(response.data["recent_activity"]), 4)

    def test_recent_activity_ordered_newest_first(self):
        self._create_log(description="oldest")
        self._create_log(description="middle")
        self._create_log(description="newest")

        self.client.force_authenticate(self.manager_user)
        response = self.client.get(self.url)

        created_ats = [entry["created_at"] for entry in response.data["recent_activity"]]
        self.assertEqual(created_ats, sorted(created_ats, reverse=True))

    def test_system_generated_log_with_no_user_returns_none(self):
        self._create_log(user=None, description="system event")

        self.client.force_authenticate(self.manager_user)
        response = self.client.get(self.url)

        self.assertIsNone(response.data["recent_activity"][0]["user"])

    def test_recent_activity_not_scoped_to_today(self):
        """recent_activity pulls the last 4 logs overall, not just today's."""
        old_log = self._create_log(description="old")
        old_log.created_at = self._now() - timedelta(days=10)
        old_log.save(update_fields=["created_at"])

        self.client.force_authenticate(self.manager_user)
        response = self.client.get(self.url)

        self.assertEqual(len(response.data["recent_activity"]), 1)

    def test_recent_activity_not_nested_under_today(self):
        """Regression guard: recent_activity must be a top-level key, not under 'today'."""
        self._create_log()

        self.client.force_authenticate(self.manager_user)
        response = self.client.get(self.url)

        self.assertIn("recent_activity", response.data)
        self.assertNotIn("recent_activity", response.data["today"])