from rest_framework import serializers
from .models import Patient
from django.contrib.auth import get_user_model

User = get_user_model()

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
    # Staff type the username; we resolve it to the actual User instance
    user = serializers.CharField(write_only=True)

    class Meta:
        model = Patient
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

    def validate_user(self, value):
        try:
            return User.objects.get(username=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("No user found with that username.")

    def create(self, validated_data):
        # validated_data['user'] is already a resolved User instance
        return Patient.objects.create(**validated_data)

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

class PatientPublicSerializer(serializers.ModelSerializer):
    
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    profile_picture = serializers.SerializerMethodField()

    class Meta:
        model = Patient
        fields = [
            'profile_picture',
            'personal_id', 
            'first_name', 
            'last_name', 
            'birth_date',
            'gender',
            'phone_number',
            'blood_type',
        ]
        read_only_fields = [
            'profile_picture',
            'personal_id', 
            'birth_date',
            'gender',
            'phone_number',
            'blood_type',
        ]
        
    def get_profile_picture(self, obj):
        if not obj.user.profile_picture:
            return None
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(obj.user.profile_picture.url)
        return obj.user.profile_picture.url