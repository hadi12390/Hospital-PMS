"""
Tenant Isolation Test Suite
=============================
Tests for the multi-tenant + django-tenants isolation mechanism.

Covers:
1. Two hospitals (schemas) each keep their own Patient data separate,
   even when the Patient rows share the same primary key (IDOR-style check).
2. Users created in one hospital's schema are invisible from another schema.
3. IsValidTenantUser permission behaves correctly (valid, missing, mismatched, malformed token).
4. Sanity check that the permission class isn't silently bypassed on any viewset.

NOTE: There is no "view a single patient" endpoint yet, so these tests
check isolation directly at the database/schema level rather than through
real HTTP requests. Once that endpoint exists, add HTTP-level tests on top
of this (send a token from hospital A, hit hospital B's domain, expect 403).
"""

from django.db import connection
from django.test import TransactionTestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from django_tenants.utils import schema_context

from tenants.models import Hospital as TenantModel, Domain  # django-tenants tenant model
from core.permissions import IsValidTenantUser

User = get_user_model()


class CrossTenantIsolationTests(TransactionTestCase):
    """
    DB-level tests: no HTTP calls, no views needed yet.

    We create two hospitals (schemas), and in each one create a Patient
    with the SAME primary key (id=5). This is the classic setup that
    exposes an IDOR bug: if schema isolation is broken, querying id=5
    from one hospital's context could leak the other hospital's data.

    NOTE: deliberately subclasses TransactionTestCase, not TestCase.
    TestCase wraps everything (including setUpClass) in one open
    transaction, and dropping a schema with CASCADE needs deferred
    trigger/constraint checks to fire — which can't happen inside that
    open transaction ("pending trigger events" error). TransactionTestCase
    doesn't wrap tests in a transaction, so schema creation/deletion works.

    Also NOTE: deliberately NOT TenantTestCase either.
    TenantTestCase auto-creates and switches into its own single tenant,
    which conflicts with a test that needs to create two tenants itself
    (tenant creation is only allowed while connected to the public schema).
    """

    @classmethod
    def setUpClass(cls):
        super().setUpClass()

        with schema_context("public"):
            # --- Tenant A ---
            cls.tenant_a = TenantModel(schema_name="royal_hospital", name="Royal Hospital")
            cls.tenant_a.save()
            Domain.objects.create(domain="tenanta.testserver", tenant=cls.tenant_a, is_primary=True)

            # --- Tenant B ---
            cls.tenant_b = TenantModel(schema_name="mvmod_hospital", name="MVMOD Hospital")
            cls.tenant_b.save()
            Domain.objects.create(domain="tenantb.testserver", tenant=cls.tenant_b, is_primary=True)

        # Users + a patient record inside each schema
        with schema_context("royal_hospital"):
            cls.user_a = User.objects.create_user(username="user5", password="pass", email="a5@x.com")
            # Same pk (id=5) on purpose, in both schemas — this is exactly the
            # scenario that exposes IDOR if tenant isolation fails.
            from patient.models import Patient
            cls.patient_a = Patient.objects.create(
                id=5,
                user=cls.user_a,
                first_name="Test",
                last_name="PatientA",
                personal_id="tenant-a-secret",
                birth_date="1990-01-01",
            )

        with schema_context("mvmod_hospital"):
            cls.user_b = User.objects.create_user(username="user5", password="pass", email="b5@x.com")
            from patient.models import Patient
            cls.patient_b = Patient.objects.create(
                id=5,
                user=cls.user_b,
                first_name="Test",
                last_name="PatientB",
                personal_id="tenant-b-secret",
                birth_date="1990-01-01",
            )

    @classmethod
    def tearDownClass(cls):
        with schema_context("public"):
            cls.tenant_a.delete(force_drop=True)
            cls.tenant_b.delete(force_drop=True)
        super().tearDownClass()

    # ------------------------------------------------------------------
    # 1. Baseline: each hospital sees its own patient correctly
    # ------------------------------------------------------------------
    def test_royal_hospital_sees_its_own_patient(self):
        from patient.models import Patient
        with schema_context("royal_hospital"):
            patient = Patient.objects.get(id=5)
        self.assertEqual(patient.personal_id, "tenant-a-secret")

    def test_mvmod_hospital_sees_its_own_patient(self):
        from patient.models import Patient
        with schema_context("mvmod_hospital"):
            patient = Patient.objects.get(id=5)
        self.assertEqual(patient.personal_id, "tenant-b-secret")

    # ------------------------------------------------------------------
    # 2. The core check: same id, different schema, different data
    # ------------------------------------------------------------------
    def test_same_id_returns_different_data_per_schema(self):
        """
        Both hospitals have a Patient with id=5. If schema isolation is
        broken (e.g. both pointing at the same table), these would be
        equal or one would silently overwrite the other. They must not be.
        """
        from patient.models import Patient
        with schema_context("royal_hospital"):
            patient_from_a = Patient.objects.get(id=5)
        with schema_context("mvmod_hospital"):
            patient_from_b = Patient.objects.get(id=5)

        self.assertNotEqual(patient_from_a.personal_id, patient_from_b.personal_id)
        self.assertEqual(patient_from_a.personal_id, "tenant-a-secret")
        self.assertEqual(patient_from_b.personal_id, "tenant-b-secret")

    def test_royal_hospital_user_not_visible_in_mvmod_schema(self):
        """
        user_a was created inside royal_hospital's schema. It must not
        exist inside mvmod_hospital's schema (schemas don't share user rows).
        """
        with schema_context("mvmod_hospital"):
            exists = User.objects.filter(email="a5@x.com").exists()
        self.assertFalse(exists)


class IsValidTenantUserUnitTests(APITestCase):
    """
    Fast, isolated unit tests for the permission class itself,
    without spinning up full tenant schemas/HTTP stack.
    """

    class DummyRequest:
        def __init__(self, user=None, auth=None):
            self.user = user
            self.auth = auth

    class DummyUser:
        is_authenticated = True

    def setUp(self):
        self.perm = IsValidTenantUser()
        self.view = None  # not used by has_permission in current implementation

    def test_matching_schema_allows(self):
        request = self.DummyRequest(
            user=self.DummyUser(),
            auth={"tenant_schema": connection.schema_name},
        )
        self.assertTrue(self.perm.has_permission(request, self.view))

    def test_mismatched_schema_denies(self):
        request = self.DummyRequest(
            user=self.DummyUser(),
            auth={"tenant_schema": "some_other_schema"},
        )
        self.assertFalse(self.perm.has_permission(request, self.view))

    def test_missing_claim_denies(self):
        request = self.DummyRequest(
            user=self.DummyUser(),
            auth={},  # no tenant_schema key at all
        )
        self.assertFalse(self.perm.has_permission(request, self.view))

    def test_no_auth_object_denies(self):
        request = self.DummyRequest(user=self.DummyUser(), auth=None)
        self.assertFalse(self.perm.has_permission(request, self.view))

    def test_unauthenticated_user_denies(self):
        class Unauthenticated:
            is_authenticated = False

        request = self.DummyRequest(
            user=Unauthenticated(),
            auth={"tenant_schema": connection.schema_name},
        )
        self.assertFalse(self.perm.has_permission(request, self.view))

    def test_no_user_denies(self):
        request = self.DummyRequest(
            user=None,
            auth={"tenant_schema": connection.schema_name},
        )
        self.assertFalse(self.perm.has_permission(request, self.view))


class PermissionCoverageAuditTests(APITestCase):
    """
    Regression guard: fails loudly if a viewset is added later that
    forgets to require IsValidTenantUser (e.g. via a local override
    of permission_classes that drops the default).

    This does NOT replace manual review, but catches the common mistake
    of `permission_classes = [IsAuthenticated]` shadowing the safer default.
    """

    def test_all_viewsets_require_valid_tenant_user(self):
        from rest_framework.viewsets import ViewSetMixin
        from django.urls import get_resolver

        offenders = []
        resolver = get_resolver()

        def walk(patterns):
            for p in patterns:
                if hasattr(p, "url_patterns"):
                    walk(p.url_patterns)
                else:
                    callback = getattr(p, "callback", None)
                    view_class = getattr(callback, "cls", None) if callback else None
                    if view_class and issubclass(view_class, ViewSetMixin):
                        perms = getattr(view_class, "permission_classes", [])
                        if IsValidTenantUser not in perms:
                            offenders.append(view_class.__name__)

        walk(resolver.url_patterns)

        self.assertEqual(
            offenders,
            [],
            f"These viewsets do not enforce IsValidTenantUser: {offenders}",
        )