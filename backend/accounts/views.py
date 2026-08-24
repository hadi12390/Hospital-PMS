from rest_framework .generics import CreateAPIView, RetrieveUpdateAPIView
from .serializers import StaffCreateUserSerializer
from .permissions import IsManager, IsDoctor, IsPatient, IsUnregisteredPatient
from logs.models import ActivityLog
from django.core.cache import cache
from rest_framework.views import APIView
from rest_framework.response import Response
from allauth.account.models import EmailAddress
from .serializers import PersonalInformationSerializer, ManagerMeSerializer, DoctorMeSerializer, PatientMeSerializer
from rest_framework.permissions import IsAuthenticated

class StaffCreateUserView(CreateAPIView):
    serializer_class = StaffCreateUserSerializer
    permission_classes = [IsManager]

    def perform_create(self, serializer):
        user = serializer.save()
        role = user.role
        ActivityLog.objects.create(
            user=self.request.user,
            action=ActivityLog.Action.REGISTER,
            description=f"Manager {self.request.user.username} ({self.request.user.email}) created a {role} account for {user.username} ({user.email}), (verifid)."
        )

class ChangeEmailView(APIView):

    permission_classes = [IsUnregisteredPatient | IsPatient | IsDoctor | IsManager]    

    def post(self, request):
        user = request.user
        new_email = request.data.get("email")

        if not new_email:
            return Response({"detail": "Email is required."}, status=400)

        # -----------------------------------
        # 1. Maximum 3 changes per hour
        # -----------------------------------

        hourly_key = f"email_change_hour:{user.id}"

        hourly_count = cache.get(hourly_key, 0)

        if hourly_count >= 3:
            return Response(
                {"detail": "Too many email change requests. Try again later."},
                status=429
            )

        # -----------------------------------
        # 2. Maximum 5 confirmation emails/day
        # -----------------------------------

        daily_key = f"email_confirmation_day:{user.id}"

        daily_count = cache.get(daily_key, 0)

        if daily_count >= 5:
            return Response(
                {"detail": "Too many confirmation emails today."},
                status=429
            )

        # -----------------------------------
        # 3. Same email → wait 5 minutes
        # -----------------------------------

        email_key = f"email_confirmation:{user.id}:{new_email.lower()}"

        if cache.get(email_key):
            return Response(
                {"detail": "Please wait before requesting another confirmation email."},
                status=429
            )

        # -----------------------------------
        # Check if email is already used
        # -----------------------------------

        if EmailAddress.objects.filter(email=new_email).exists():
            return Response(
                {"detail": "Email already in use."},
                status=400
            )

        # -----------------------------------
        # Create unverified email
        # -----------------------------------

        email_address = EmailAddress.objects.create(
            user=user,
            email=new_email,
            primary=False,
            verified=False,
        )

        # -----------------------------------
        # Send confirmation
        # -----------------------------------

        email_address.send_confirmation(request)


        # -----------------------------------
        # Update rate limits
        # -----------------------------------

        cache.set(hourly_key, hourly_count + 1, 60 * 60)

        cache.set(daily_key, daily_count + 1, 60 * 60 * 24)

        cache.set(email_key, True, 60 * 5)

        return Response({
            "detail": "Confirmation email sent to new address."
        })

class PersonalInformationEditView(RetrieveUpdateAPIView):
    serializer_class = PersonalInformationSerializer
    permission_classes = [IsManager | IsDoctor | IsPatient]

    def get_object(self):
        return self.request.user

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer_class = {
            "manager": ManagerMeSerializer,
            "doctor": DoctorMeSerializer,
            "patient": PatientMeSerializer,
        }[user.role]
        return Response(serializer_class(user).data)