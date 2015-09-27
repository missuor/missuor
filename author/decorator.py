# coding=utf-8
from django.core.urlresolvers import reverse
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth.views import redirect_to_login as RedirectToLogin

from utils import JsonResponseSuccess, JsonResponseFailure


def login_required(func):
    def _inner(request, *args, **kwargs):
        is_ajax = request.is_ajax()
        redirect = request.path
        if request.user.is_authenticated():
            return func(request, *args, **kwargs)

        if is_ajax:
            return JsonResponseFailure(msg='login required', redirect=redirect)
        return RedirectToLogin(redirect, reverse('author:login'), 'redirect')
    return _inner

def admin_required(request, *args, **kwargs):
    @login_required
    def _inner(request, *args, **kwargs):
        is_ajax = request.is_ajax()
        if hasattr(request, 'user') and request.user and \
            request.user.is_superuser:
            return func(request, *args, **kwargs)

        return JsonResponseFailure(msg='admin required')
    return _inner