from django.shortcuts import render
from rest_framework .generics import CreateAPIView
from .serializers import StaffCreateUserSerializer
from .permissions import IsManager

class StaffCreateUserView(CreateAPIView):
    serializer_class = StaffCreateUserSerializer
    permission_classes = [IsManager]