from accounts.permissions import IsManager
from .serializers import ManagerSerializer
from doctor.serializers import DoctorSerializer
from appointments.serializers import AppointmentSerializer
from rest_framework .generics import CreateAPIView, RetrieveUpdateDestroyAPIView


class AddDoctor(CreateAPIView):
    serializer_class = DoctorSerializer
    permission_classes = [IsManager]

class AddManager(CreateAPIView):
    serializer_class = ManagerSerializer
    permission_classes = [IsManager]

class ManagerAddAppointment(CreateAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [IsManager]