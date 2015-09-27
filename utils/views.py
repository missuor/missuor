# coding=utf-8
import os
import datetime
import traceback
from django.conf import settings
from django.http import HttpResponse
from django.template.response import TemplateResponse
from django.core.urlresolvers import reverse as django_reverse
from django.core.cache import cache
from utils.storage import get_private_url as _url

from utils import forms
from utils import JsonResponseSuccess, JsonResponseFailure, model_to_dict, key
import datetime
from utils.storage import qiniu_upload_fileobj

domain = settings.CLOUD_SOTRAGE_DOMAIN

def file_uploader(request, *args, **kwargs):
    url = qiniu_upload_fileobj(request.FILES['img'], 'missuor', '.png')
    with_domain = request.POST.get('full_path', False)
    if with_domain:
        url = '%s/%s' % (domain, url)
    return JsonResponseSuccess(url=url)

def get_key(request, *args, **kwargs):
    return JsonResponseSuccess(key=key())

def reverse(request, *args, **kwargs):
    name = request.GET.get('url', None)
    try:
        return HttpResponse(django_reverse(name))
    except:
        return HttpResponse('/')

def demo(request, *args, **kwargs):
    template_name = kwargs.get('template', 'index')
    template_name = 'demos/%s.html' % template_name
    return TemplateResponse(request, template_name)