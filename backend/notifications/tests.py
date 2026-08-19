from datetime import time, timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone

from django_tenants.test.cases import TenantTestCase

from rest_framework import status
from rest_framework.test import APIRequestFactory, force_authenticate

from patient.models import Patient
from doctor.models import Doctor
from appointments.models import Appointment
from notifications.models import Notification
from notifications.views import NotificationListView, NotificationDetailView


User = get_user_model()


class NotificationTests(TenantTestCase):

    def setUp(self):
        # =================================================
        # Patient 1 (the "owner" of most test notifications)
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
        # Patient 2 (used to check isolation between users)
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
        # Doctor (so we have something to attach an appointment to)
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

        self.appointment = Appointment.objects.create(
            doctor=self.doctor,
            patient=self.patient,
            scheduled_time=timezone.now() + timedelta(days=1),
            appointment_type=Appointment.AppointmentType.CONSULTATION,
            duration_minutes=30,
            status=Appointment.Status.PENDING,
        )

        # =================================================
        # Notifications
        # =================================================

        # unread, belongs to patient1, linked to an appointment
        self.unread_notification = Notification.create_notification(
            user=self.patient_user,
            notification_type=Notification.Type.APPOINTMENT,
            title="Appointment created",
            message="Your appointment was booked.",
            appointment=self.appointment,
        )

        # already-read, belongs to patient1 -> should NOT show up in the list view
        self.read_notification = Notification.create_notification(
            user=self.patient_user,
            notification_type=Notification.Type.REMINDER,
            title="Reminder",
            message="Don't forget your appointment.",
        )
        self.read_notification.is_read = True
        self.read_notification.save()

        # unread, belongs to patient2 -> should never show up for patient1
        self.other_users_notification = Notification.create_notification(
            user=self.other_patient_user,
            notification_type=Notification.Type.APPOINTMENT,
            title="Appointment created",
            message="Your appointment was booked.",
        )

        self.factory = APIRequestFactory()

    # ---------------------------------------------------
    # helpers
    # ---------------------------------------------------

    def call_list(self, user=None):
        request = self.factory.get("/notifications/")
        if user is not None:
            force_authenticate(request, user=user)
        return NotificationListView.as_view()(request)

    def call_detail_patch(self, notification, data, user=None):
        request = self.factory.patch(
            f"/notifications/{notification.public_id}/",
            data,
            format="json",
        )
        if user is not None:
            force_authenticate(request, user=user)
        return NotificationDetailView.as_view()(
            request, public_id=notification.public_id
        )

    # =====================================================
    # 1. List only returns the current user's notifications
    # =====================================================

    def test_list_only_returns_own_notifications(self):
        response = self.call_list(user=self.patient_user)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        returned_ids = [n["public_id"] for n in response.data]
        self.assertIn(str(self.unread_notification.public_id), [str(i) for i in returned_ids])
        self.assertNotIn(
            str(self.other_users_notification.public_id),
            [str(i) for i in returned_ids],
        )

    # =====================================================
    # 2. List excludes already-read notifications
    # =====================================================

    def test_list_excludes_read_notifications(self):
        response = self.call_list(user=self.patient_user)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        returned_ids = [str(n["public_id"]) for n in response.data]
        self.assertIn(str(self.unread_notification.public_id), returned_ids)
        self.assertNotIn(str(self.read_notification.public_id), returned_ids)

    # =====================================================
    # 3. Unauthenticated user cannot list notifications
    # =====================================================

    def test_unauthenticated_cannot_list(self):
        response = self.call_list(user=None)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # =====================================================
    # 4. Owner can mark their notification as read
    # =====================================================

    def test_owner_can_mark_as_read(self):
        response = self.call_detail_patch(
            self.unread_notification, {"is_read": True}, user=self.patient_user
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.unread_notification.refresh_from_db()
        self.assertTrue(self.unread_notification.is_read)

    # =====================================================
    # 5. Cannot mark another user's notification as read
    # =====================================================

    def test_cannot_mark_other_users_notification(self):
        response = self.call_detail_patch(
            self.other_users_notification, {"is_read": True}, user=self.patient_user
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        self.other_users_notification.refresh_from_db()
        self.assertFalse(self.other_users_notification.is_read)

    # =====================================================
    # 6. Detail lookup uses public_id
    # =====================================================

    def test_detail_uses_public_id(self):
        response = self.call_detail_patch(
            self.unread_notification, {"is_read": True}, user=self.patient_user
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    # =====================================================
    # 7. create_notification() defaults is_read=False and
    #    handles a missing appointment gracefully
    # =====================================================

    def test_create_notification_defaults(self):
        notification = Notification.create_notification(
            user=self.patient_user,
            notification_type=Notification.Type.REMINDER,
            title="Test",
            message="Test message",
        )

        self.assertFalse(notification.is_read)
        self.assertIsNone(notification.appointment)

    # =====================================================
    # 8. appointment_public_id serializes correctly when set
    # =====================================================

    def test_appointment_public_id_in_list_response(self):
        response = self.call_list(user=self.patient_user)

        matching = [
            n for n in response.data
            if str(n["public_id"]) == str(self.unread_notification.public_id)
        ]
        self.assertEqual(len(matching), 1)
        self.assertEqual(
            str(matching[0]["appointment_public_id"]),
            str(self.appointment.public_id),
        )