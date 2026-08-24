# accounts/serializers.py
from rest_framework import serializers
from .models import User
from allauth.account.models import EmailAddress
from dj_rest_auth.registration.serializers import RegisterSerializer 
from logs.models import ActivityLog
from dj_rest_auth.serializers import PasswordResetSerializer
from .forms import CustomAllAuthPasswordResetForm

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.db import connection
from doctor.models import Doctor
from patient.models import Patient
from manager.models import Manager

class StaffCreateUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "profile_picture",
            "username",
            "email",
            "first_name",
            "last_name",
            "password",
            "password2",
            "role"
        ]
    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError(
                {"password2": "Passwords do not match."}
            )

        return attrs

    def create(self, validated_data):
        validated_data.pop("password2")
        password = validated_data.pop("password")


        user = User(**validated_data)
        user.set_password(password)
        user.save()

        EmailAddress.objects.create(
            user=user,
            email=user.email,
            verified=True,
            primary=True,
        )
        return user

class CustomRegisterSerializer(RegisterSerializer): # edit the dj-rest-register
    def save(self, request): 
        user = super().save(request)
        ActivityLog.objects.create( 
            user=user,
            action=ActivityLog.Action.REGISTER,
            description=f"{user.email} registered (unverified yet)."
        )
        # now we saved the object but we added the log
        return user


class CustomPasswordResetSerializer(PasswordResetSerializer):
    def validate_email(self, value):
        self.reset_form = CustomAllAuthPasswordResetForm(data=self.initial_data)
        if not self.reset_form.is_valid():
            raise serializers.ValidationError(self.reset_form.errors)
        return value


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Stamp the current database schema name into the JWT
        token['tenant_schema'] = connection.schema_name
        return token


class PersonalInformationSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "profile_picture",
            "username",
            "email",
            "first_name",
            "last_name",
        ]
        read_only_fields = ['email']
        


class BaseMeSerializer(serializers.ModelSerializer):
    role = serializers.CharField(read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)
    public_id = serializers.CharField(source="user.public_id", read_only=True)

    class Meta:
        fields = ["public_id", "role", "email", "first_name", "last_name"]


class DoctorMeSerializer(BaseMeSerializer):
    class Meta(BaseMeSerializer.Meta):
        model = Doctor
        fields = BaseMeSerializer.Meta.fields + ["specialty"]

class PatientMeSerializer(BaseMeSerializer):
    class Meta(BaseMeSerializer.Meta):
        model = Patient
        fields = BaseMeSerializer.Meta.fields + ["reliability_score"]

class ManagerMeSerializer(BaseMeSerializer):
    class Meta(BaseMeSerializer.Meta):
        model = Manager
        fields = BaseMeSerializer.Meta.fields