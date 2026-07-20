from rest_framework .generics import CreateAPIView, RetrieveUpdateDestroyAPIView
from .serializers import DoctorSerializer, PatientSerializer, ManagerSerializer, AppointmentSerializer
from accounts.permissions import IsManager, IsPatient, IsDoctor
from .models import Appointment

class AddDoctor(CreateAPIView):
    serializer_class = DoctorSerializer
    permission_classes = [IsManager]

class AddPatient(CreateAPIView):
    serializer_class = PatientSerializer
    permission_classes = [IsManager | IsDoctor | IsPatient]

class AddManager(CreateAPIView):
    serializer_class = ManagerSerializer
    permission_classes = [IsManager]

class ManagerAddAppointment(CreateAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [IsManager]