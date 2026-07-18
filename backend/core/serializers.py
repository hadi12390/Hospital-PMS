from rest_framework import serializers
from .models import Doctor, Patient, Appointment, MedicalHistory, MedicalDocument, Manager

class AddUserToDoctor(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = "__all__"


class AddUserToPatient(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = "__all__"


class AddUserToManager(serializers.ModelSerializer):
    class Meta:
        model = Manager
        fields = "__all__"