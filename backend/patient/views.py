from rest_framework.generics import RetrieveUpdateAPIView
from accounts.permissions import IsPatient
from .serializers import ProfileSerializer

class ProfileEditView(RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsPatient]

    def get_object(self):
        return self.request.user.patient