from rest_framework .generics import CreateAPIView
from .serializers import StaffCreateUserSerializer
from .permissions import IsManager
from logs.models import ActivityLog

class StaffCreateUserView(CreateAPIView):
    serializer_class = StaffCreateUserSerializer
    permission_classes = [IsManager]

    def perform_create(self, serializer):
        user = serializer.save()
        role = user.role
        ActivityLog.objects.create(
            user=self.request.user,
            action=ActivityLog.Action.REGISTER,
            description=f"Manager {self.request.user.username} ({self.request.user.email}) created a {role} account for {user.username} ({user.email}), (verifid)."
        )
        