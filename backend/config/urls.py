from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
]

# WARNING: This is only for local development (DEBUG = True).
# NEVER use this in production to serve sensitive patient/medical files
# In production, use private cloud storage (like AWS S3 or Google Cloud Storage)
# alongside 'django-storages' to keep patient PDFs locked down and secure.
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
