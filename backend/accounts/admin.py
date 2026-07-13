from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from .models import User

class CustomUserAdmin(UserAdmin):
    form = UserChangeForm
    add_form = UserCreationForm
    model = User
    
    # Customize what you see in the table listing users
    list_display = ['email', 'username', 'role', 'is_staff', 'is_active']
    ordering = ['email']

    # 1. Fields to show when EDITING an existing user
    fieldsets = UserAdmin.fieldsets + (
        ('Custom Fields', {'fields': ('role',)}),
    )

    # 2. Fields to show when CREATING a new user (Fixes your exact error)
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'role', 'password', 'is_staff', 'is_active'),
        }),
    )

admin.site.register(User, CustomUserAdmin)