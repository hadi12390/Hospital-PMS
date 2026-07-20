from rest_framework .generics import CreateAPIView, RetrieveUpdateDestroyAPIView
from patient.serializers import PatientSerializer
from accounts.permissions import IsManager, IsPatient, IsDoctor

class AddPatient(CreateAPIView):
    serializer_class = PatientSerializer
    permission_classes = [IsManager | IsDoctor | IsPatient]

