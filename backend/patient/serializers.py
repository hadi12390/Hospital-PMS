from rest_framework import serializers
from .models import Patient

# 1. Used by Patients registering themselves
class PatientSelfRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        # Exclude 'user' completely so it cannot be passed in the body
        fields = [
            'personal_id', 
            'first_name', 
            'last_name', 
            'birth_date',
            'gender',
            'phone_number',
            'blood_type',
        ]


# 2. Used by Doctors and Managers registering a patient
class StaffPatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        # Staff explicitly specify which user account this profile belongs to
        fields = [
            'user',
            'personal_id', 
            'first_name', 
            'last_name', 
            'birth_date',
            'gender',
            'phone_number',
            'blood_type',
        ]

class ProfileSerializer(serializers.ModelSerializer):\

    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    
    class Meta:
        model = Patient
        fields = [
            'personal_id', 
            'first_name', 
            'last_name', 
            'birth_date',
            'gender',
            'phone_number',
            'blood_type',
        ]
        read_only_fields = fields