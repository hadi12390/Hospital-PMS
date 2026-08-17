# """
# Tests for ManagerDashboard (manager/views.py).

# Tenant setup mirrors patient/tests.py's PatientDashboardTestBase.
# """

# from datetime import timedelta, time, date

# from django.db import connection
# from django.test import TransactionTestCase, override_settings
# from django.urls import reverse
# from django.contrib.auth import get_user_model
# from django.utils import timezone

# from django_tenants.utils import schema_context
# from django_tenants.test.client import TenantClient

# from rest_framework.test import APIClient
# from rest_framework import status

# from appointments.models import Appointment
# from patient.models import Patient
# from doctor.models import Doctor
# from manager.models import Manager
# from logs.models import ActivityLog
# from tenants.models import Hospital, Domain

# User = get_user_model()


# class TenantAPIClient(TenantClient, APIClient):
#     pass


# @override_settings(ALLOWED_HOSTS=["managerdashboardtest.testserver", "testserver"])
# class ManagerDashboardTestBase(TransactionTestCase):

#     @classmethod
#     def setUpClass(cls):
#         super().setUpClass()
#         with schema_context("public"):
#             cls.tenant = Hospital(
#                 schema_name="manager_dashboard_test_hospital",
#                 name="Manager Dashboard Test Hospital",
#             )
#             cls.tenant.save()
#             Domain.objects.create(
#                 domain="managerdashboardtest.testserver",
#                 tenant=cls.tenant,
#                 is_primary=True,
#             )

#     @classmethod
#     def tearDownClass(cls):
#         connection.set_schema_to_public()
#         with schema_context("public"):
#             cls.tenant.delete(force_drop=True)
#         super().tearDownClass()

#     def _fixture_teardown(self):
#         with schema_context(self.tenant.schema_name):
#             ActivityLog.objects.all().delete()
#             Appointment.objects.all().delete()
#             Patient.objects.all().delete()
#             Doctor.objects.all().delete()
#             Manager.objects.all().delete()
#             User.objects.all().delete()

#     def setUp(self):
#         connection.set_tenant(self.tenant)
#         self.client = TenantAPIClient(tenant=self.tenant)

#         self.manager_user = self._create_user(
#             email="manager@example.com",
#             username="rana.khalil",
#             first_name="Rana",
#             last_name="Khalil",
#             role=User.Role.MANAGER,
#         )
#         self.manager = Manager.objects.create(
#             user=self.manager_user,
#             title="Head of Operations",
#             department="Front Desk",
#         )

#         self.doctor_user = self._create_user(
#             email="doctor@example.com",
#             username="emily.carter",
#             first_name="Emily",
#             last_name="Carter",
#             role=User.Role.DOCTOR,
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

#         self.patient_user = self._create_user(
#             email="patient@example.com",
#             username="sara.youssef",
#             first_name="Sara",
#             last_name="Youssef",
#             role=User.Role.PATIENT,
#         )
#         self.patient = Patient.objects.create(
#             user=self.patient_user,
#             first_name="Sara",
#             last_name="Youssef",
#             personal_id="patient-personal-id-1",
#             birth_date=date(1995, 6, 12),
#         )

#         self.url = reverse("manager-dashboard")

#     # ---- helpers -----------------------------------------------------

#     def _create_user(self, email, username, first_name, last_name, role, status=None):
#         user = User.objects.create_user(
#             username=username,
#             email=email,
#             password="testpass123",
#             first_name=first_name,
#             last_name=last_name,
#             role=role,
#         )
#         if status:
#             user.status = status
#             user.save(update_fields=["status"])
#         return user

#     def _create_appointment(self, **kwargs):
#         defaults = {
#             "patient": self.patient,
#             "doctor": self.doctor,
#             "appointment_type": "consultation",
#             "scheduled_time": timezone.now(),
#         }
#         defaults.update(kwargs)
#         return Appointment.objects.create(**defaults)

#     def _create_guest_patient(self, personal_id="guest-1", first_name="Guest", last_name="Person"):
#         """Patient with no linked User account (walk-in/visitor case)."""
#         return Patient.objects.create(
#             user=None,
#             first_name=first_name,
#             last_name=last_name,
#             personal_id=personal_id,
#             birth_date=date(1988, 1, 1),
#         )

#     def _create_log(self, **kwargs):
#         defaults = {
#             "user": self.manager_user,
#             "action": ActivityLog.Action.REGISTER,
#             "description": "test log entry",
#         }
#         defaults.update(kwargs)
#         return ActivityLog.objects.create(**defaults)

#     def _now(self):
#         return timezone.now()


# class ManagerDashboardPermissionTests(ManagerDashboardTestBase):

#     def test_requires_authentication(self):
#         response = self.client.get(self.url)
#         self.assertIn(
#             response.status_code,
#             (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN),
#         )

#     def test_rejects_non_manager_user(self):
#         self.client.force_authenticate(self.doctor_user)
#         response = self.client.get(self.url)
#         self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

#     def test_404_when_manager_profile_missing(self):
#         bare_user = self._create_user(
#             email="bare@example.com",
#             username="no.profile",
#             first_name="No",
#             last_name="Profile",
#             role=User.Role.MANAGER,
#         )
#         self.client.force_authenticate(bare_user)
#         response = self.client.get(self.url)
#         self.assertIn(
#             response.status_code,
#             (status.HTTP_404_NOT_FOUND, status.HTTP_403_FORBIDDEN),
#         )


# class ManagerDashboardAppointmentTests(ManagerDashboardTestBase):

#     def test_only_appointments_completed_today_are_counted(self):
#         now = self._now()

#         self._create_appointment(
#             status=Appointment.Status.COMPLETED,
#             completed_at=now,
#         )
#         self._create_appointment(
#             status=Appointment.Status.COMPLETED,
#             completed_at=now - timedelta(days=2),
#         )

#         self.client.force_authenticate(self.manager_user)
#         response = self.client.get(self.url)

#         self.assertEqual(response.status_code, status.HTTP_200_OK)
#         self.assertEqual(response.data["today"]["appointments_count"], 1)

#     def test_last_three_returns_three_most_recently_completed(self):
#         now = self._now()

#         for i in range(5):
#             self._create_appointment(
#                 status=Appointment.Status.COMPLETED,
#                 completed_at=now - timedelta(minutes=i),
#             )

#         self.client.force_authenticate(self.manager_user)
#         response = self.client.get(self.url)

#         self.assertEqual(len(response.data["today"]["last_three"]), 3)
#         returned_times = [
#             entry["completed_at"] for entry in response.data["today"]["last_three"]
#         ]
#         self.assertEqual(returned_times, sorted(returned_times, reverse=True))

#     def test_patients_without_user_excluded_from_list_but_counted(self):
#         now = self._now()
#         guest = self._create_guest_patient()

#         self._create_appointment(
#             patient=self.patient,
#             status=Appointment.Status.COMPLETED,
#             completed_at=now,
#         )
#         self._create_appointment(
#             patient=guest,
#             status=Appointment.Status.COMPLETED,
#             completed_at=now,
#         )

#         self.client.force_authenticate(self.manager_user)
#         response = self.client.get(self.url)

#         self.assertEqual(response.data["today"]["appointments_count"], 2)
#         # only patients with a linked user show up by name
#         self.assertEqual(response.data["today"]["patients"], ["Sara Youssef"])
#         # but patients_count reflects ALL distinct patients today, named or not
#         self.assertEqual(response.data["today"]["patients_count"], 2)

#     def test_appointment_with_no_patient_still_counted_but_not_in_patients(self):
#         now = self._now()

#         self._create_appointment(
#             patient=None,
#             status=Appointment.Status.COMPLETED,
#             completed_at=now,
#         )

#         self.client.force_authenticate(self.manager_user)
#         response = self.client.get(self.url)

#         self.assertEqual(response.data["today"]["appointments_count"], 1)
#         self.assertEqual(response.data["today"]["patients"], [])
#         # patient_id is None here, and {None} still has length 1
#         self.assertEqual(response.data["today"]["patients_count"], 1)


# class ManagerDashboardDoctorTests(ManagerDashboardTestBase):

#     def test_doctor_within_shift_and_active_is_counted(self):
#         now = self._now()
#         self.doctor.start_time = (now - timedelta(hours=1)).time()
#         self.doctor.end_time = (now + timedelta(hours=1)).time()
#         self.doctor.save()

#         self.client.force_authenticate(self.manager_user)
#         response = self.client.get(self.url)

#         self.assertEqual(response.data["doctors"]["active_count"], 1)

#     def test_doctor_outside_shift_hours_excluded(self):
#         now = self._now()
#         self.doctor.start_time = (now + timedelta(hours=1)).time()
#         self.doctor.end_time = (now + timedelta(hours=2)).time()
#         self.doctor.save()

#         self.client.force_authenticate(self.manager_user)
#         response = self.client.get(self.url)

#         self.assertEqual(response.data["doctors"]["active_count"], 0)

#     def test_disabled_doctor_excluded_even_within_shift(self):
#         now = self._now()
#         self.doctor.start_time = (now - timedelta(hours=1)).time()
#         self.doctor.end_time = (now + timedelta(hours=1)).time()
#         self.doctor.save()

#         self.doctor_user.status = User.Status.DISABLED
#         self.doctor_user.save(update_fields=["status"])

#         self.client.force_authenticate(self.manager_user)
#         response = self.client.get(self.url)

#         self.assertEqual(response.data["doctors"]["active_count"], 0)


# class ManagerDashboardAppointmentStatusTests(ManagerDashboardTestBase):

#     def test_appointment_status_breakdown(self):
#         now = self._now()

#         self._create_appointment(status=Appointment.Status.PENDING)
#         self._create_appointment(status=Appointment.Status.CANCELLED)
#         self._create_appointment(status=Appointment.Status.CANCELLED)
#         self._create_appointment(status=Appointment.Status.CONFIRMED)
#         self._create_appointment(
#             status=Appointment.Status.COMPLETED, completed_at=now
#         )
#         self._create_appointment(
#             status=Appointment.Status.COMPLETED, completed_at=now
#         )
#         self._create_appointment(
#             status=Appointment.Status.COMPLETED, completed_at=now
#         )

#         self.client.force_authenticate(self.manager_user)
#         response = self.client.get(self.url)

#         breakdown = response.data["appointments_by_status"]
#         self.assertEqual(breakdown["pending_appointments"], 1)
#         self.assertEqual(breakdown["cancelled_appointments"], 2)
#         self.assertEqual(breakdown["confirmed_appointments"], 1)
#         self.assertEqual(breakdown["completed_appointments"], 3)

#     def test_status_breakdown_not_scoped_to_today(self):
#         """
#         appointment_status aggregates over `appointments` (all-time), not
#         `today_appointments` - locked in on purpose per earlier decision.
#         If that assumption changes, this test should change with it.
#         """
#         old_time = self._now() - timedelta(days=30)

#         self._create_appointment(
#             status=Appointment.Status.COMPLETED, completed_at=old_time
#         )

#         self.client.force_authenticate(self.manager_user)
#         response = self.client.get(self.url)

#         self.assertEqual(
#             response.data["appointments_by_status"]["completed_appointments"], 1
#         )
#         self.assertEqual(response.data["today"]["appointments_count"], 0)


# class ManagerDashboardRecentActivityTests(ManagerDashboardTestBase):

#     def test_returns_at_most_four_logs(self):
#         for i in range(6):
#             self._create_log(description=f"log {i}")

#         self.client.force_authenticate(self.manager_user)
#         response = self.client.get(self.url)

#         self.assertEqual(len(response.data["recent_activity"]), 4)

#     def test_recent_activity_ordered_newest_first(self):
#         self._create_log(description="oldest")
#         self._create_log(description="middle")
#         self._create_log(description="newest")

#         self.client.force_authenticate(self.manager_user)
#         response = self.client.get(self.url)

#         created_ats = [entry["created_at"] for entry in response.data["recent_activity"]]
#         self.assertEqual(created_ats, sorted(created_ats, reverse=True))

#     def test_system_generated_log_with_no_user_returns_none(self):
#         self._create_log(user=None, description="system event")

#         self.client.force_authenticate(self.manager_user)
#         response = self.client.get(self.url)

#         self.assertIsNone(response.data["recent_activity"][0]["user"])

#     def test_recent_activity_not_scoped_to_today(self):
#         """recent_activity pulls the last 4 logs overall, not just today's."""
#         old_log = self._create_log(description="old")
#         old_log.created_at = self._now() - timedelta(days=10)
#         old_log.save(update_fields=["created_at"])

#         self.client.force_authenticate(self.manager_user)
#         response = self.client.get(self.url)

#         self.assertEqual(len(response.data["recent_activity"]), 1)

#     def test_recent_activity_not_nested_under_today(self):
#         """Regression guard: recent_activity must be a top-level key, not under 'today'."""
#         self._create_log()

#         self.client.force_authenticate(self.manager_user)
#         response = self.client.get(self.url)

#         self.assertIn("recent_activity", response.data)
#         self.assertNotIn("recent_activity", response.data["today"])

"""
Tests for ManageDoctors (doctor/views.py or manager/views.py — adjust import).

Tenant setup mirrors manager/tests.py's ManagerDashboardTestBase.
"""

"""
Tests for ManageDoctors (manager/views.py).

Tenant setup mirrors manager/tests.py's ManagerDashboardTestBase.
"""

# from datetime import timedelta, time

# from django.db import connection
# from django.test import TransactionTestCase, override_settings
# from django.urls import reverse
# from django.contrib.auth import get_user_model
# from django.utils import timezone

# from django_tenants.utils import schema_context
# from django_tenants.test.client import TenantClient

# from rest_framework.test import APIClient
# from rest_framework import status

# from doctor.models import Doctor
# from manager.models import Manager
# from tenants.models import Hospital, Domain

# User = get_user_model()


# class TenantAPIClient(TenantClient, APIClient):
#     pass


# @override_settings(ALLOWED_HOSTS=["managedoctorstest.testserver", "testserver"])
# class ManageDoctorsTestBase(TransactionTestCase):

#     @classmethod
#     def setUpClass(cls):
#         super().setUpClass()
#         with schema_context("public"):
#             cls.tenant = Hospital(
#                 schema_name="manage_doctors_test_hospital",
#                 name="Manage Doctors Test Hospital",
#             )
#             cls.tenant.save()
#             Domain.objects.create(
#                 domain="managedoctorstest.testserver",
#                 tenant=cls.tenant,
#                 is_primary=True,
#             )

#     @classmethod
#     def tearDownClass(cls):
#         connection.set_schema_to_public()
#         with schema_context("public"):
#             cls.tenant.delete(force_drop=True)
#         super().tearDownClass()

#     def _fixture_teardown(self):
#         with schema_context(self.tenant.schema_name):
#             Doctor.objects.all().delete()
#             Manager.objects.all().delete()
#             User.objects.all().delete()

#     def setUp(self):
#         connection.set_tenant(self.tenant)
#         self.client = TenantAPIClient(tenant=self.tenant)

#         self.manager_user = self._create_user(
#             email="manager@example.com",
#             username="rana.khalil",
#             first_name="Rana",
#             last_name="Khalil",
#             role=User.Role.MANAGER,
#         )
#         self.manager = Manager.objects.create(
#             user=self.manager_user,
#             title="Head of Operations",
#             department="Front Desk",
#         )

#         self.url = reverse("manage-doctors")

#     # ---- helpers -----------------------------------------------------

#     def _create_user(self, email, username, first_name, last_name, role, status=None):
#         user = User.objects.create_user(
#             username=username,
#             email=email,
#             password="testpass123",
#             first_name=first_name,
#             last_name=last_name,
#             role=role,
#         )
#         if status:
#             user.status = status
#             user.save(update_fields=["status"])
#         return user

#     def _create_doctor(self, first_name, last_name, username, email,
#                         specialty="General", start_time=None, end_time=None,
#                         status=None):
#         user = self._create_user(
#             email=email,
#             username=username,
#             first_name=first_name,
#             last_name=last_name,
#             role=User.Role.DOCTOR,
#             status=status,
#         )
#         return Doctor.objects.create(
#             user=user,
#             specialty=specialty,
#             start_time=start_time,
#             end_time=end_time,
#         )

#     def _now(self):
#         return timezone.now()


# class ManageDoctorsPermissionTests(ManageDoctorsTestBase):

#     def test_requires_authentication(self):
#         response = self.client.get(self.url)
#         self.assertIn(
#             response.status_code,
#             (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN),
#         )

#     def test_rejects_non_manager_user(self):
#         doctor = self._create_doctor(
#             "Emily", "Carter", "emily.carter", "doctor@example.com",
#             start_time=time(9, 0), end_time=time(17, 0),
#         )
#         self.client.force_authenticate(doctor.user)
#         response = self.client.get(self.url)
#         self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


# class ManageDoctorsCountTests(ManageDoctorsTestBase):

#     def test_total_doctors_count(self):
#         self._create_doctor(
#             "Emily", "Carter", "emily.carter", "emily@example.com",
#             start_time=time(9, 0), end_time=time(17, 0),
#         )
#         self._create_doctor(
#             "John", "Doe", "john.doe", "john@example.com",
#             start_time=time(9, 0), end_time=time(17, 0),
#         )

#         self.client.force_authenticate(self.manager_user)
#         response = self.client.get(self.url)

#         self.assertEqual(response.status_code, status.HTTP_200_OK)
#         self.assertEqual(response.data["total_doctors"], 2)

#     def test_disabled_doctors_excluded_from_total(self):
#         self._create_doctor(
#             "Emily", "Carter", "emily.carter", "emily@example.com",
#             start_time=time(9, 0), end_time=time(17, 0),
#         )
#         self._create_doctor(
#             "John", "Doe", "john.doe", "john@example.com",
#             start_time=time(9, 0), end_time=time(17, 0),
#             status=User.Status.DISABLED,
#         )

#         self.client.force_authenticate(self.manager_user)
#         response = self.client.get(self.url)

#         self.assertEqual(response.data["total_doctors"], 1)


# class ManageDoctorsActiveShiftTests(ManageDoctorsTestBase):

#     def test_normal_shift_active_now(self):
#         now = self._now()
#         self._create_doctor(
#             "Emily", "Carter", "emily.carter", "emily@example.com",
#             start_time=(now - timedelta(hours=1)).time(),
#             end_time=(now + timedelta(hours=1)).time(),
#         )

#         self.client.force_authenticate(self.manager_user)
#         response = self.client.get(self.url)

#         self.assertEqual(response.data["active_doctors"], 1)

#     def test_normal_shift_not_active_now(self):
#         now = self._now()
#         self._create_doctor(
#             "Emily", "Carter", "emily.carter", "emily@example.com",
#             start_time=(now + timedelta(hours=1)).time(),
#             end_time=(now + timedelta(hours=2)).time(),
#         )

#         self.client.force_authenticate(self.manager_user)
#         response = self.client.get(self.url)

#         self.assertEqual(response.data["active_doctors"], 0)

#     def test_overnight_shift_active_now(self):
#         """Regression guard for the midnight-wraparound bug (start > end)."""
#         now = self._now()
#         self._create_doctor(
#             "Emily", "Carter", "emily.carter", "emily@example.com",
#             start_time=(now - timedelta(hours=1)).time(),
#             end_time=(now - timedelta(hours=2)).time(),  # "before" start on the clock
#         )

#         self.client.force_authenticate(self.manager_user)
#         response = self.client.get(self.url)

#         self.assertEqual(response.data["active_doctors"], 1)

#     def test_disabled_doctor_excluded_even_within_shift(self):
#         now = self._now()
#         self._create_doctor(
#             "Emily", "Carter", "emily.carter", "emily@example.com",
#             start_time=(now - timedelta(hours=1)).time(),
#             end_time=(now + timedelta(hours=1)).time(),
#             status=User.Status.DISABLED,
#         )

#         self.client.force_authenticate(self.manager_user)
#         response = self.client.get(self.url)

#         self.assertEqual(response.data["active_doctors"], 0)


# class ManageDoctorsSummaryListTests(ManageDoctorsTestBase):

#     def test_doctor_with_no_schedule_shows_not_exist(self):
#         self._create_doctor(
#             "Emily", "Carter", "emily.carter", "emily@example.com",
#             start_time=None, end_time=None,
#         )

#         self.client.force_authenticate(self.manager_user)
#         response = self.client.get(self.url)

#         summary = response.data["doctors"][0]
#         self.assertEqual(summary["status"], "Not exist")

#     def test_doctor_summary_contains_public_id_and_name(self):
#         doctor = self._create_doctor(
#             "Emily", "Carter", "emily.carter", "emily@example.com",
#             start_time=time(9, 0), end_time=time(17, 0),
#         )

#         self.client.force_authenticate(self.manager_user)
#         response = self.client.get(self.url)

#         summary = response.data["doctors"][0]
#         self.assertEqual(summary["doctor"]["public_id"], str(doctor.user.public_id))
#         self.assertEqual(summary["doctor"]["name"], "Emily Carter")

"""
Tests for ManageDoctors APIView.

Follows the established project pattern:
- TransactionTestCase (required for django-tenants schema switching)
- schema_context to create fixtures inside the tenant schema
- TenantAPIClient for making requests against the tenant domain
- Manual dict-shape assertions, since the view builds Response bodies
  by hand rather than through a serializer

NOTE: adjust the import paths and the exact kwargs used when creating
User/Doctor/Appointment below to match your actual model fields/factories
(I've inferred the field names from ManageDoctors itself — start_time,
end_time, specialty, follow_up_duration, checkup_duration,
consultation_duration, and User.status / User.public_id — but I don't
have your models.py or existing factories in front of me).
"""

"""
Tests for ManageDoctors APIView.

Follows the established project pattern:
- TransactionTestCase (required for django-tenants schema switching)
- schema_context to create fixtures inside the tenant schema
- TenantAPIClient for making requests against the tenant domain
- Manual dict-shape assertions, since the view builds Response bodies
  by hand rather than through a serializer

NOTE: adjust the exact kwargs used when creating User/Doctor/Appointment
below to match your actual model fields/factories (I've inferred the
field names from ManageDoctors itself — start_time, end_time, specialty,
follow_up_duration, checkup_duration, consultation_duration, and
User.status / User.public_id — but I don't have your models.py or
existing factories in front of me).

Also make sure "test-hospital.testserver" (or whatever domain you use
below) is present in your settings' ALLOWED_HOSTS for tests — this bit
you before with django-tenants.
"""

"""
Tests for ManageDoctors APIView.

Follows the established project pattern:
- TransactionTestCase (required for django-tenants schema switching)
- schema_context to create fixtures inside the tenant schema
- TenantAPIClient for making requests against the tenant domain
- Manual dict-shape assertions, since the view builds Response bodies
  by hand rather than through a serializer

NOTE: adjust the exact kwargs used when creating User/Doctor/Appointment
below to match your actual model fields/factories (I've inferred the
field names from ManageDoctors itself — start_time, end_time, specialty,
follow_up_duration, checkup_duration, consultation_duration, and
User.status / User.public_id — but I don't have your models.py or
existing factories in front of me).

Also make sure "test-hospital.testserver" (or whatever domain you use
below) is present in your settings' ALLOWED_HOSTS for tests — this bit
you before with django-tenants.
"""

"""
Tests for ManageDoctors (doctor_summary unit tests + GET endpoint integration tests).

IMPORTANT — this file makes some assumptions about your models/permissions that I
could not see from the view code alone. Please adjust the marked sections to match
your actual project:

1. Import paths at the top (`myapp.models`, `myapp.views`, `myapp.permissions`) —
   point these at your real modules.
2. User model fields — I assumed `username`, `email`, `first_name`, `last_name`,
   and a `status` field with `User.Status.ACTIVE` / `INACTIVE`. If your custom
   user model differs, update `make_user()`.
3. IsManager permission — I assumed a `role` field on User with value "MANAGER"
   grants access. Update `make_manager_user()` and `test_requires_manager_permission`
   to match however IsManager actually determines a manager.
4. Appointment.Status — I assumed a `CANCELLED` status exists in addition to
   COMPLETED/CONFIRMED/PENDING (used in `test_only_counts_todays_relevant_appointment_statuses`).
   Swap it for whatever "excluded" status your enum actually has.
5. Field names on Doctor/Appointment (start_time, end_time, specialty,
   follow_up_duration, checkup_duration, consultation_duration, doctor FK,
   scheduled_time, appointment_type) are taken directly from the view code, so
   those should already match.

Run with: python manage.py test path.to.this.test_module
"""
"""
Tests for ManageDoctors (manager/views.py).

Pattern mirrors the project's established tenant test base (see
ManagerDashboardTestBase / ManageDoctorsTestBase in manager/tests.py):
- TransactionTestCase (required for django-tenants schema switching)
- schema_context to create/teardown fixtures inside the tenant schema
- TenantAPIClient (TenantClient + APIClient) for requests against the tenant domain
- Manual dict-shape assertions, since the view builds Response bodies by hand

Two test groups:
1. ManageDoctorsPermissionTests / CountTests / ActiveShiftTests / SummaryAndCapacityTests
   -> correctness of the view's business logic, all within a single tenant.
2. ManageDoctorsTenantIsolationTests
   -> a manager in Hospital A can never see/affect Hospital B's doctors.
   This is a distinct concern from correctness and deserves its own class:
   it's checking that django-tenants' schema isolation is actually being
   respected by this view, not just that the arithmetic is right.

ADJUST if these don't match your project:
- `reverse("manage-doctors")` — swap for your actual URL name.
- The `doctor`/`manager`/`appointments`/`tenants` import paths.
- ALLOWED_HOSTS domain strings if you use different test domains.
"""

"""Tests for ManageDoctors (manager/views.py).

Pattern mirrors the project's established tenant test base (see
ManagerDashboardTestBase / ManageDoctorsTestBase in manager/tests.py):
- TransactionTestCase (required for django-tenants schema switching)
- schema_context to create/teardown fixtures inside the tenant schema
- TenantAPIClient (TenantClient + APIClient) for requests against the tenant domain
- Manual dict-shape assertions, since the view builds Response bodies by hand

Two test groups:
1. ManageDoctorsPermissionTests / CountTests / ActiveShiftTests / SummaryAndCapacityTests
   -> correctness of the view's business logic, all within a single tenant.
2. ManageDoctorsTenantIsolationTests
   -> a manager in Hospital A can never see/affect Hospital B's doctors.
   This is a distinct concern from correctness and deserves its own class:
   it's checking that django-tenants' schema isolation is actually being
   respected by this view, not just that the arithmetic is right.

ADJUST if these don't match your project:
- `reverse("manage-doctors")` — swap for your actual URL name.
- The `doctor`/`manager`/`appointments`/`tenants` import paths.
- ALLOWED_HOSTS domain strings if you use different test domains.
"""
"""
Tests for ManageDoctors (manager/views.py).

Pattern mirrors the project's established tenant test base (see
ManagerDashboardTestBase / ManageDoctorsTestBase in manager/tests.py):
- TransactionTestCase (required for django-tenants schema switching)
- schema_context to create/teardown fixtures inside the tenant schema
- TenantAPIClient (TenantClient + APIClient) for requests against the tenant domain
- Manual dict-shape assertions, since the view builds Response bodies by hand

Two test groups:
1. ManageDoctorsPermissionTests / CountTests / ActiveShiftTests / SummaryAndCapacityTests
   -> correctness of the view's business logic, all within a single tenant.
2. ManageDoctorsTenantIsolationTests
   -> a manager in Hospital A can never see/affect Hospital B's doctors.
   This is a distinct concern from correctness and deserves its own class:
   it's checking that django-tenants' schema isolation is actually being
   respected by this view, not just that the arithmetic is right.

ADJUST if these don't match your project:
- `reverse("manage-doctors")` — swap for your actual URL name.
- The `doctor`/`manager`/`appointments`/`tenants` import paths.
- ALLOWED_HOSTS domain strings if you use different test domains.
"""

from datetime import timedelta, time
from django.db import connection
from django.test import TransactionTestCase, override_settings
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.utils import timezone
from django_tenants.utils import schema_context
from django_tenants.test.client import TenantClient
from rest_framework.test import APIClient
from rest_framework import status
from doctor.models import Doctor
from manager.models import Manager
from appointments.models import Appointment
from tenants.models import Hospital, Domain

User = get_user_model()


class TenantAPIClient(TenantClient, APIClient):
    pass


# ---------------------------------------------------------------------------
# Single-tenant base: business-logic tests
# ---------------------------------------------------------------------------
@override_settings(ALLOWED_HOSTS=["managedoctorstest.testserver", "testserver"])
class ManageDoctorsTestBase(TransactionTestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        with schema_context("public"):
            cls.tenant = Hospital(
                schema_name="manage_doctors_test_hospital",
                name="Manage Doctors Test Hospital",
            )
            cls.tenant.save()
            Domain.objects.create(
                domain="managedoctorstest.testserver",
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
            Appointment.objects.all().delete()
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
        self.url = reverse("manage-doctors")

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

    def _create_doctor(
        self,
        first_name,
        last_name,
        username,
        email,
        specialty="General",
        start_time=None,
        end_time=None,
        status=None,
        consultation_duration=30,
        follow_up_duration=15,
        checkup_duration=45,
    ):
        user = self._create_user(
            email=email,
            username=username,
            first_name=first_name,
            last_name=last_name,
            role=User.Role.DOCTOR,
            status=status,
        )
        return Doctor.objects.create(
            user=user,
            specialty=specialty,
            start_time=start_time,
            end_time=end_time,
            consultation_duration=consultation_duration,
            follow_up_duration=follow_up_duration,
            checkup_duration=checkup_duration,
        )

    def _create_appointment(self, doctor, **kwargs):
        defaults = {
            "doctor": doctor,
            "patient": None,
            "appointment_type": Appointment.AppointmentType.CONSULTATION,
            "status": Appointment.Status.CONFIRMED,
            "scheduled_time": timezone.now(),
        }
        defaults.update(kwargs)
        return Appointment.objects.create(**defaults)

    def _now(self):
        return timezone.now()


# ---------------------------------------------------------------------------
# Permission tests (exercises accounts/permissions.py::IsManager)
# ---------------------------------------------------------------------------
class ManageDoctorsPermissionTests(ManageDoctorsTestBase):
    def test_requires_authentication(self):
        response = self.client.get(self.url)
        self.assertIn(
            response.status_code,
            (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN),
        )

    def test_rejects_non_manager_role(self):
        doctor = self._create_doctor(
            "Emily", "Carter", "emily.carter", "emily@example.com",
            start_time=time(9, 0), end_time=time(17, 0),
        )
        self.client.force_authenticate(doctor.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_rejects_disabled_manager(self):
        self.manager_user.status = User.Status.DISABLED
        self.manager_user.save(update_fields=["status"])
        self.client.force_authenticate(self.manager_user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_rejects_manager_role_without_manager_profile(self):
        """User has role='manager' but no linked Manager row (IsManager checks
        getattr(request.user, 'manager', None))."""
        bare_user = self._create_user(
            email="bare@example.com",
            username="no.profile",
            first_name="No",
            last_name="Profile",
            role=User.Role.MANAGER,
        )
        self.client.force_authenticate(bare_user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_accepts_valid_manager(self):
        self.client.force_authenticate(self.manager_user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)


# ---------------------------------------------------------------------------
# Doctor count tests
# ---------------------------------------------------------------------------
class ManageDoctorsCountTests(ManageDoctorsTestBase):
    def test_total_doctors_count(self):
        self._create_doctor(
            "Emily", "Carter", "emily.carter", "emily@example.com",
            start_time=time(9, 0), end_time=time(17, 0),
        )
        self._create_doctor(
            "John", "Doe", "john.doe", "john@example.com",
            start_time=time(9, 0), end_time=time(17, 0),
        )
        self.client.force_authenticate(self.manager_user)
        response = self.client.get(self.url)
        self.assertEqual(response.data["total_doctors"], 2)

    def test_disabled_doctors_excluded_from_total(self):
        self._create_doctor(
            "Emily", "Carter", "emily.carter", "emily@example.com",
            start_time=time(9, 0), end_time=time(17, 0),
        )
        self._create_doctor(
            "John", "Doe", "john.doe", "john@example.com",
            start_time=time(9, 0), end_time=time(17, 0),
            status=User.Status.DISABLED,
        )
        self.client.force_authenticate(self.manager_user)
        response = self.client.get(self.url)
        self.assertEqual(response.data["total_doctors"], 1)

    def test_expired_doctors_excluded_from_total(self):
        self._create_doctor(
            "Emily", "Carter", "emily.carter", "emily@example.com",
            start_time=time(9, 0), end_time=time(17, 0),
            status=User.Status.EXPIRED,
        )
        self.client.force_authenticate(self.manager_user)
        response = self.client.get(self.url)
        self.assertEqual(response.data["total_doctors"], 0)


# ---------------------------------------------------------------------------
# Active / on-leave shift tests
# ---------------------------------------------------------------------------
from unittest.mock import patch
from django.utils import timezone
from datetime import datetime, time
class ManageDoctorsActiveShiftTests(ManageDoctorsTestBase):

    def test_normal_shift_active_now(self):
        fixed_now = timezone.make_aware(datetime(2026, 8, 17, 12, 0, 0))
        
        with patch("django.utils.timezone.now", return_value=fixed_now):
            self._create_doctor(
                "Emily", "Carter", "emily.carter", "emily@example.com",
                start_time=time(9, 0),
                end_time=time(17, 0),
            )
            self.client.force_authenticate(self.manager_user)
            response = self.client.get(self.url)
            
            self.assertEqual(response.data["active_doctors"], 1)
            self.assertEqual(response.data["on_leave_doctors"], 0)

    def test_overnight_shift_active_before_midnight(self):
        """Active overnight shift when current time is 23:00 (shift: 22:00 -> 06:00)."""
        fixed_now = timezone.make_aware(datetime(2026, 8, 17, 23, 0, 0))
        
        with patch("django.utils.timezone.now", return_value=fixed_now):
            self._create_doctor(
                "Emily", "Carter", "emily.carter", "emily@example.com",
                start_time=time(22, 0),
                end_time=time(6, 0),
            )
            self.client.force_authenticate(self.manager_user)
            response = self.client.get(self.url)
            
            self.assertEqual(response.data["active_doctors"], 1)

    def test_overnight_shift_active_after_midnight(self):
        """Active overnight shift when current time is 02:00 AM (shift: 22:00 -> 06:00)."""
        fixed_now = timezone.make_aware(datetime(2026, 8, 17, 2, 0, 0))
        
        with patch("django.utils.timezone.now", return_value=fixed_now):
            self._create_doctor(
                "Emily", "Carter", "emily.carter", "emily@example.com",
                start_time=time(22, 0),
                end_time=time(6, 0),
            )
            self.client.force_authenticate(self.manager_user)
            response = self.client.get(self.url)
            
            self.assertEqual(response.data["active_doctors"], 1)

    def test_doctor_with_no_schedule_counts_as_neither(self):
        """start_time/end_time both None -> 'Not exist' and not counted as active."""
        self._create_doctor(
            "Emily", "Carter", "emily.carter", "emily@example.com",
            start_time=None, end_time=None,
        )
        self.client.force_authenticate(self.manager_user)
        response = self.client.get(self.url)
        
        summary = response.data["doctors"][0]
        self.assertEqual(summary["status"], "Not exist")
        self.assertEqual(response.data["active_doctors"], 0)

    def test_disabled_doctor_excluded_even_within_shift(self):
        fixed_now = timezone.make_aware(datetime(2026, 8, 17, 12, 0, 0))
        
        with patch("django.utils.timezone.now", return_value=fixed_now):
            self._create_doctor(
                "Emily", "Carter", "emily.carter", "emily@example.com",
                start_time=time(11, 0),
                end_time=time(13, 0),
                status=User.Status.DISABLED,
            )
            self.client.force_authenticate(self.manager_user)
            response = self.client.get(self.url)
            
            self.assertEqual(response.data["active_doctors"], 0)
            self.assertEqual(response.data["total_doctors"], 0)

# ---------------------------------------------------------------------------
# Per-doctor summary shape + capacity math
# ---------------------------------------------------------------------------
class ManageDoctorsSummaryAndCapacityTests(ManageDoctorsTestBase):
    def test_summary_contains_public_id_and_name(self):
        doctor = self._create_doctor(
            "Emily", "Carter", "emily.carter", "emily@example.com",
            start_time=time(9, 0), end_time=time(17, 0),
        )
        self.client.force_authenticate(self.manager_user)
        response = self.client.get(self.url)
        summary = response.data["doctors"][0]
        self.assertEqual(summary["doctor"]["public_id"], str(doctor.user.public_id))
        self.assertEqual(summary["doctor"]["name"], "Emily Carter")
        self.assertEqual(summary["specialty"], "General")

    def test_capacity_zero_with_no_appointments_today(self):
        self._create_doctor(
            "Emily", "Carter", "emily.carter", "emily@example.com",
            start_time=time(9, 0), end_time=time(17, 0),  # 480 min shift
        )
        self.client.force_authenticate(self.manager_user)
        response = self.client.get(self.url)
        self.assertEqual(response.data["doctors"][0]["capacity"], 0)
        self.assertEqual(response.data["capacity"], 0)

    def test_capacity_reflects_todays_booked_minutes(self):
        doctor = self._create_doctor(
            "Emily", "Carter", "emily.carter", "emily@example.com",
            start_time=time(9, 0), end_time=time(17, 0),  # 480 min shift
            consultation_duration=30, follow_up_duration=15, checkup_duration=45,
        )
        # 2 follow-ups (15) + 1 checkup (45) = 75 booked minutes
        self._create_appointment(
            doctor, appointment_type=Appointment.AppointmentType.FOLLOW_UP,
            status=Appointment.Status.CONFIRMED,
        )
        self._create_appointment(
            doctor, appointment_type=Appointment.AppointmentType.FOLLOW_UP,
            status=Appointment.Status.COMPLETED,
        )
        self._create_appointment(
            doctor, appointment_type=Appointment.AppointmentType.CHECKUP,
            status=Appointment.Status.PENDING,
        )
        self.client.force_authenticate(self.manager_user)
        response = self.client.get(self.url)
        expected_capacity = round(75 / 480 * 100)
        self.assertEqual(response.data["doctors"][0]["capacity"], expected_capacity)
        self.assertEqual(response.data["capacity"], expected_capacity)

    def test_cancelled_and_no_show_appointments_excluded_from_capacity(self):
        doctor = self._create_doctor(
            "Emily", "Carter", "emily.carter", "emily@example.com",
            start_time=time(9, 0), end_time=time(17, 0),
            checkup_duration=60,
        )
        self._create_appointment(
            doctor, appointment_type=Appointment.AppointmentType.CHECKUP,
            status=Appointment.Status.CANCELLED,
        )
        self._create_appointment(
            doctor, appointment_type=Appointment.AppointmentType.CHECKUP,
            status=Appointment.Status.NO_SHOW,
        )
        self.client.force_authenticate(self.manager_user)
        response = self.client.get(self.url)
        self.assertEqual(response.data["doctors"][0]["capacity"], 0)

    def test_appointments_from_other_days_excluded_from_capacity(self):
        doctor = self._create_doctor(
            "Emily", "Carter", "emily.carter", "emily@example.com",
            start_time=time(9, 0), end_time=time(17, 0),
            checkup_duration=60,
        )
        self._create_appointment(
            doctor, appointment_type=Appointment.AppointmentType.CHECKUP,
            status=Appointment.Status.CONFIRMED,
            scheduled_time=timezone.now() - timedelta(days=1),
        )
        self.client.force_authenticate(self.manager_user)
        response = self.client.get(self.url)
        self.assertEqual(response.data["doctors"][0]["capacity"], 0)

    def test_average_capacity_across_multiple_doctors(self):
        doc1 = self._create_doctor(
            "Emily", "Carter", "emily.carter", "emily@example.com",
            start_time=time(9, 0), end_time=time(17, 0),  # 480 min
            follow_up_duration=10, checkup_duration=0, consultation_duration=0,
        )
        self._create_appointment(
            doc1, appointment_type=Appointment.AppointmentType.FOLLOW_UP,
        )  # 10 / 480 -> round = 2%
        doc2 = self._create_doctor(
            "John", "Doe", "john.doe", "john@example.com",
            start_time=time(9, 0), end_time=time(17, 0),  # 480 min
            checkup_duration=480, follow_up_duration=0, consultation_duration=0,
        )
        self._create_appointment(
            doc2, appointment_type=Appointment.AppointmentType.CHECKUP,
        )  # 480 / 480 = 100%
        self.client.force_authenticate(self.manager_user)
        response = self.client.get(self.url)
        expected_avg = round((round(10 / 480 * 100) + 100) / 2)
        self.assertEqual(response.data["capacity"], expected_avg)


# ---------------------------------------------------------------------------
# Cross-tenant isolation
# ---------------------------------------------------------------------------
@override_settings(
    ALLOWED_HOSTS=[
        "manage-doctors-hospital-a.testserver",
        "manage-doctors-hospital-b.testserver",
        "testserver",
    ]
)
class ManageDoctorsTenantIsolationTests(TransactionTestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        with schema_context("public"):
            cls.tenant_a = Hospital(
                schema_name="manage_doctors_isolation_hospital_a",
                name="Isolation Hospital A",
            )
            cls.tenant_a.save()
            Domain.objects.create(
                domain="manage-doctors-hospital-a.testserver",
                tenant=cls.tenant_a,
                is_primary=True,
            )
            cls.tenant_b = Hospital(
                schema_name="manage_doctors_isolation_hospital_b",
                name="Isolation Hospital B",
            )
            cls.tenant_b.save()
            Domain.objects.create(
                domain="manage-doctors-hospital-b.testserver",
                tenant=cls.tenant_b,
                is_primary=True,
            )

    @classmethod
    def tearDownClass(cls):
        connection.set_schema_to_public()
        with schema_context("public"):
            cls.tenant_a.delete(force_drop=True)
            cls.tenant_b.delete(force_drop=True)
        super().tearDownClass()

    def _fixture_teardown(self):
        for tenant in (self.tenant_a, self.tenant_b):
            with schema_context(tenant.schema_name):
                Appointment.objects.all().delete()
                Doctor.objects.all().delete()
                Manager.objects.all().delete()
                User.objects.all().delete()

    def _create_manager(self, tenant, email, username):
        connection.set_tenant(tenant)
        user = User.objects.create_user(
            username=username, email=email, password="testpass123",
            first_name="Manager", last_name="Person", role=User.Role.MANAGER,
        )
        Manager.objects.create(user=user, title="Head of Operations")
        return user

    def _create_doctor(self, tenant, email, username, first_name="Doc", last_name="Tor"):
        connection.set_tenant(tenant)
        user = User.objects.create_user(
            username=username, email=email, password="testpass123",
            first_name=first_name, last_name=last_name, role=User.Role.DOCTOR,
        )
        return Doctor.objects.create(
            user=user, specialty="General",
            start_time=time(9, 0), end_time=time(17, 0),
        )

    def setUp(self):
        self.manager_a = self._create_manager(
            self.tenant_a, "manager.a@example.com", "manager.a"
        )
        self.doctor_a = self._create_doctor(
            self.tenant_a, "doctor.a@example.com", "doctor.a", "Alice", "InA"
        )
        self.manager_b = self._create_manager(
            self.tenant_b, "manager.b@example.com", "manager.b"
        )
        self.doctor_b = self._create_doctor(
            self.tenant_b, "doctor.b@example.com", "doctor.b", "Bob", "InB"
        )
        self.client_a = TenantAPIClient(tenant=self.tenant_a)
        self.client_b = TenantAPIClient(tenant=self.tenant_b)
        self.url = reverse("manage-doctors")

    def test_manager_only_sees_own_tenants_doctors(self):
        connection.set_tenant(self.tenant_a)
        self.client_a.force_authenticate(self.manager_a)
        response = self.client_a.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_doctors"], 1)
        public_ids = [d["doctor"]["public_id"] for d in response.data["doctors"]]
        self.assertEqual(public_ids, [str(self.doctor_a.user.public_id)])
        self.assertNotIn(str(self.doctor_b.user.public_id), public_ids)

    def test_manager_from_tenant_a_cannot_authenticate_against_tenant_b_domain(self):
        """A manager who only exists in Hospital A's schema should not be
        usable to authenticate a request against Hospital B's domain."""
        connection.set_tenant(self.tenant_b)
        self.client_b.force_authenticate(self.manager_a)
        response = self.client_b.get(self.url)
        self.assertIn(
            response.status_code,
            (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND),
        )

    def test_appointments_do_not_leak_across_tenants_into_capacity(self):
        connection.set_tenant(self.tenant_a)
        Appointment.objects.create(
            doctor=self.doctor_a,
            patient=None,
            appointment_type=Appointment.AppointmentType.CHECKUP,
            status=Appointment.Status.CONFIRMED,
            scheduled_time=timezone.now(),
        )
        connection.set_tenant(self.tenant_b)
        self.client_b.force_authenticate(self.manager_b)
        response = self.client_b.get(self.url)
        # Hospital B's doctor should show zero capacity — A's appointment
        # must not be visible from B's schema.
        self.assertEqual(response.data["doctors"][0]["capacity"], 0)