from pathlib import Path
import os # for the media
# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/6.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-_a8#h5(ds8rfi#xru1)o6=2ytlv0k7a09&g#%-dy*k#d^f1*m1'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '.localhost']


# Application definition

SHARED_APPS = [
    'django_tenants',
    'tenants',
    'corsheaders',
    'django.contrib.contenttypes',
    'django.contrib.staticfiles',
    'drf_spectacular',
]

TENANT_APPS = [
    'django.contrib.contenttypes',
    'django.contrib.auth',
    'django.contrib.admin',      # moved here — needs auth/accounts in same schema
    'django.contrib.sessions',
    'django.contrib.messages',
    'accounts',                
    'doctor',
    'patient',
    'manager',
    'appointments',
    'notifications',
    'logs',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'dj_rest_auth',
    'dj_rest_auth.registration',
    'rest_framework',
    'rest_framework_simplejwt',
    'django.contrib.sites',
    'core',
    'configuration',
]

INSTALLED_APPS = list(SHARED_APPS) + [
    app for app in TENANT_APPS
    if app not in SHARED_APPS
]

TENANT_MODEL = "tenants.Hospital"
TENANT_DOMAIN_MODEL = "tenants.Domain"

ACCOUNT_LOGIN_METHODS = {"email"}
ACCOUNT_SIGNUP_FIELDS = ["email*", "username*", "password1*", "password2*"]


MIDDLEWARE = [
    'django_tenants.middleware.main.TenantMainMiddleware', # ⚠️ must be at the top !!
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'allauth.account.middleware.AccountMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'


WSGI_APPLICATION = 'config.wsgi.application'


# Database
# https://docs.djangoproject.com/en/6.0/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django_tenants.postgresql_backend', # or 'django.db.backends.postgresql'
        'NAME': 'hospital_pms_db',
        'USER': 'mvmod',  # Changed from 'hadi' to your active system user
        'PASSWORD': 'jooj12332',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

DATABASE_ROUTERS = ('django_tenants.routers.TenantSyncRouter',)

# Password validation
# https://docs.djangoproject.com/en/6.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/6.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = "Asia/Amman"

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/6.0/howto/static-files/

STATIC_URL = 'static/'

SITE_ID = 1

AUTHENTICATION_BACKENDS = [
    "django.contrib.auth.backends.ModelBackend",
    "allauth.account.auth_backends.AuthenticationBackend",
]

# --- allauth ---
ACCOUNT_LOGIN_METHODS = {"email"}
ACCOUNT_UNIQUE_EMAIL = True
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
ACCOUNT_EMAIL_VERIFICATION = 'mandatory'
# --- DRF ---
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "dj_rest_auth.jwt_auth.JWTCookieAuthentication",
        "dj_rest_auth.jwt_auth.JWTCookieAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "core.permissions.IsValidTenantUser",
    ),
    "DEFAULT_RENDERER_CLASSES": (
        "rest_framework.renderers.JSONRenderer",
        "rest_framework.renderers.BrowsableAPIRenderer",
    ),
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

ACCOUNT_CONFIRM_EMAIL_ON_GET = True

# --- simplejwt ---
from datetime import timedelta
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# --- dj-rest-auth ---
REST_AUTH = {
    "USE_JWT": True,
    "JWT_AUTH_HTTPONLY": True,
    "JWT_AUTH_COOKIE": "access_token",
    "JWT_AUTH_REFRESH_COOKIE": "refresh_token",
    "JWT_AUTH_COOKIE_DOMAIN": None,
    "JWT_AUTH_SAMESITE": "Lax",
    "JWT_AUTH_SECURE": False,
    "TOKEN_MODEL": None,
    "JWT_SERIALIZER": "accounts.serializers.CustomTokenObtainPairSerializer", # use the new serializer that add the schema name to the token
    'REGISTER_SERIALIZER': 'accounts.serializers.CustomRegisterSerializer',
    "PASSWORD_RESET_USE_SITES_DOMAIN": False,
    "PASSWORD_RESET_CONFIRM_URL": "http://localhost:5173/reset-password/{uid}/{token}",
    "PASSWORD_RESET_SERIALIZER": "accounts.serializers.CustomPasswordResetSerializer",

}



# ⚠️⚠️⚠️⚠️set these two lines⚠️⚠️⚠️⚠️

# SESSION_COOKIE_SECURE = True ⚠️
# CSRF_COOKIE_SECURE = True ⚠️


# --- CORS: talk to a Vite dev server ---
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^http://([a-zA-Z0-9-]+\.)?localhost:5173$",
]

CORS_ALLOW_CREDENTIALS = True

AUTH_USER_MODEL = 'accounts.User'


# The URL that handles the media served from MEDIA_ROOT
MEDIA_URL = '/media/'

# The absolute filesystem path to the directory where uploaded files will be saved
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

FRONTEND_URL = "http://localhost:5173"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

ACCOUNT_ADAPTER = "accounts.adapter.CustomAccountAdapter"

CACHES = { # Redis is better.
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "email-rate-limit",
    }
}

CSRF_TRUSTED_ORIGINS = ["http://*.localhost:5173", "http://*.localhost:8000"]

CSRF_COOKIE_DOMAIN = None

SPECTACULAR_SETTINGS = {
    'TITLE': 'Your API',
    'DESCRIPTION': 'Your project description',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}