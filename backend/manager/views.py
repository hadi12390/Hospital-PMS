from accounts.permissions import IsManager
from .serializers import AddDoctorSerializer
from appointments.serializers import ManagerAppointmentSerializer
from rest_framework .generics import CreateAPIView


class AddDoctor(CreateAPIView):
    serializer_class = AddDoctorSerializer
    permission_classes = [IsManager]


class ManagerAddAppointment(CreateAPIView):
    serializer_class = ManagerAppointmentSerializer
    permission_classes = [IsManager]