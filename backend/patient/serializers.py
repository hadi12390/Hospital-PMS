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
            'personal_id', 
            'first_name', 
            'last_name', 
            'birth_date',
            'gender',
            'phone_number',
            'blood_type',
        ]

class ProfileSerializer(serializers.ModelSerializer):

    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')
    
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
        
    def update(self, instance, validated_data):

        user_data = validated_data.pop('user', {})
        user_instance = instance.user
        for attrs, value in user_data.items():
            setattr(user_instance, attrs, value)
        
        user_instance.save()

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance