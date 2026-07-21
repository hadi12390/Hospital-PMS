from rest_framework .generics import CreateAPIView, RetrieveUpdateDestroyAPIView
from patient.serializers import PatientSelfRegistrationSerializer, StaffPatientSerializer
from accounts.permissions import IsManager, IsPatient, IsDoctor, IsUnregisteredPatient

class AddPatient(CreateAPIView):
    permission_classes = [IsManager | IsDoctor | IsUnregisteredPatient]

    def get_serializer_class(self):
        # Pick serializer depending on role
        if self.request.user.role == "manager" or self.request.user.role == "doctor":
            return StaffPatientSerializer
        
        return PatientSelfRegistrationSerializer

    def perform_create(self, serializer):
        if self.request.user.role == "patient":
            # Patient self-registering: inject their logged-in user instance
            serializer.save(user=self.request.user)
        else:
            # Staff registering: 'user' is already validated in StaffPatientSerializer
            serializer.save()