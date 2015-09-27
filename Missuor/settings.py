# coding=utf-8
"""
Django settings for Missuor project.

Generated by 'django-admin startproject' using Django 1.8.

For more information on this file, see
https://docs.djangoproject.com/en/1.8/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.8/ref/settings/
"""

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os, sys
import local_settings

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# APPEND_SLASH = False

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.8/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'g^x&2s59y+a&=ll!%01j7bo52_rgt-j&qy_lkr@4=0+i#40kri'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = local_settings.DEBUG
# CACHES = local_settings.CACHES
ALLOWED_HOSTS = ['*']


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

]

EXTRA_APPS = (
    'author',
    'blog',
    'storage',
    'utils',
)

INSTALLED_APPS.extend(EXTRA_APPS)

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'utils.middleware.CustomRequestMiddleware',
    'utils.middleware.JsonResponseMiddleware',
)

ROOT_URLCONF = 'Missuor.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': ['',
            os.path.join(BASE_DIR, 'templates'),
            'django.template.loaders.filesystem.Loader',
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'Missuor.wsgi.application'


# Database
# https://docs.djangoproject.com/en/1.8/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': local_settings.DATABASE_NAME,
        'HOST': local_settings.DATABASE_HOST,
        'PORT': local_settings.DATABASE_PORT,
        'USER': local_settings.DATABASE_USER,
        'PASSWORD': local_settings.DATABASE_PASS,
    }
}

CACHE = {
    'default': {
        'BACKEND': 'django.core.cache.backends.memcached.MemcachedCache',
    }
}

# Internationalization
# https://docs.djangoproject.com/en/1.8/topics/i18n/

LANGUAGE_CODE = 'zh-hans'

TIME_ZONE = 'Asia/Shanghai'

USE_I18N = True

USE_L10N = True

USE_TZ = False


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.8/howto/static-files/

STATIC_URL = '/static/'
if DEBUG:
    STATICFILES_DIRS = ('', os.path.join(BASE_DIR, 'static'))
else:
    STATIC_ROOT = os.path.join(BASE_DIR, 'static')

MEDIA_ROOT = os.path.join(BASE_DIR, 'static', 'media')
CLOUD_SOTRAGE_DOMAIN = local_settings.CLOUD_SOTRAGE_DOMAIN
CLOUD_SOTRAGE_BUCKET = local_settings.CLOUD_SOTRAGE_BUCKET
CLOUD_SOTRAGE_AK = local_settings.CLOUD_SOTRAGE_AK
CLOUD_SOTRAGE_SK = local_settings.CLOUD_SOTRAGE_SK

AUTH_USER_MODEL = 'author.User'
MEDIA_ROOT = os.path.join(BASE_DIR, 'upload')
LOG_DIR = os.path.join(BASE_DIR, 'logs')
try:
    if not os.path.exists(LOG_DIR):
        os.mkdir(LOG_DIR)
except:
    pass
try:
    if not os.path.exists(MEDIA_ROOT):
        os.mkdir(MEDIA_ROOT)
except:
    pass

log_format = '%(asctime)s [%(threadName)s:%(name)s::::%(lineno)d]'
log_format += ' %(levelname)s-- %(message)s'
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse'
        }
    },
    'formatters': {
        'standard': {
            'format': log_format,
        },
    },
    'handlers': {
        'root_all': {
            'level': 'DEBUG',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': os.path.join(LOG_DIR, 'root_all.log'),
            'maxBytes': 1024 * 1024 * 5,  # 5 MB
            'backupCount': 5,
            'formatter': 'standard',
        },
        'debug': {
            'level': 'DEBUG',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': os.path.join(LOG_DIR, 'debug.log'),
            'maxBytes': 1024 * 1024 * 5,  # 5 MB
            'backupCount': 5,
            'formatter': 'standard',
        },
        'warning': {
            'level': 'WARNING',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': os.path.join(LOG_DIR, 'warning.log'),
            'maxBytes': 1024 * 1024 * 5,
            'backupCount': 5,
            'formatter': 'standard',
        },
        'error': {
            'level': 'ERROR',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': os.path.join(LOG_DIR, 'errors.log'),
            'maxBytes': 1024 * 1024 * 5,
            'backupCount': 5,
            'formatter': 'standard',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['root_all'],
            'level': 'DEBUG',
            'propagate': True,
        },
        'django.request': {
            'handlers': ['error'],
            'level': 'DEBUG',
            'propagate': False
        },
        'author': {
            'handlers': ['warning', 'debug'],
            'level': 'DEBUG',
            'propagate': False
        },
        'blog': {
            'handlers': ['warning', 'debug'],
            'level': 'DEBUG',
            'propagate': False
        },
    }
}
LOGGING = {}