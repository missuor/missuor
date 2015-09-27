# coding=utf-8
import os
import sys
from django.core.wsgi import get_wsgi_application
from bae.core.wsgi import WSGIApplication


os.environ['DJANGO_SETTINGS_MODULE'] = 'Missuor.settings'
application = WSGIApplication(get_wsgi_application())