from django.contrib import admin
from .models import Notification

@admin.register(Notification)
class NotificationsAdmin(admin.ModelAdmin):
    pass