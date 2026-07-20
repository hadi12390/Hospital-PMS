from rest_framework .generics import CreateAPIView, RetrieveUpdateDestroyAPIView
from core.serializers import AddUserToDoctor, AddUserToPatient, AddUserToManager
from accounts.permissions import IsManager, IsPatient, IsDoctor
from .models import Appointment

class AddDoctor(CreateAPIView):
    serializer_class = AddUserToDoctor
    permission_classes = [IsManager]

class AddPatient(CreateAPIView):
    serializer_class = AddUserToPatient
    permission_classes = [IsManager | IsDoctor | IsPatient]

class AddManager(CreateAPIView):
    serializer_class = AddUserToManager
    permission_classes = [IsManager]

class CreateAppointment(CreateAPIView):
    