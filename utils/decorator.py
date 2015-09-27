# coding=utf-8
import os
import json
import uuid
import decimal
import logging
import datetime
import mimetypes
from wsgiref.util import FileWrapper
from django.http import HttpResponse, HttpResponseRedirect
from django.utils.http import urlquote
from django.core.urlresolvers import reverse


logger = logging.getLogger(__name__)


class FixedFileWrapper(FileWrapper):
    def __iter__(self):
        self.filelike.seek(0)
        return self


def file_response(func):
    def _inner(request, *args, **kwargs):
        result = func(request, *args, **kwargs)

        wrapper = FixedFileWrapper(open(result['path'], 'rb'))
        content_type = mimetypes.guess_type(result['name'])[0]
        response = HttpResponse(wrapper, content_type)
        response['Content-Length'] = os.path.getsize(result['path'])
        filename = urlquote(os.path.basename(result['name']))
        disp = "attachment; filename=%s" % filename
        response['Content-Disposition'] = disp
        return response

    return _inner


def login_required(func):
    def _inner(request, *args, **kwargs):
        user = request.user
        if not user or not user.is_active:
            return HttpResponseRedirect(reverse('author:login'))
        return func(request, *args, **kwargs)

    return _inner

def admin_required(func):
    @login_required
    def _inner(request, *args, **kwargs):
        user = request.user
        if not user.is_superuser:
            return HttpResponseRedirect('/')
        return func(request, *args, **kwargs)

    return _inner
