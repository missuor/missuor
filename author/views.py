# coding=utf-8
from django.contrib.auth import login as auth_login
from django.contrib.auth import logout as auth_logout
from django.core.urlresolvers import reverse
from django.http import HttpResponseRedirect
from django.template.response import TemplateResponse
from django.utils.http import is_safe_url
from django.views.decorators.debug import sensitive_post_parameters
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_protect

from author import models
from author import forms


@sensitive_post_parameters()
@csrf_protect
@never_cache
def login(request, **kwargs):
    template_name = kwargs.get('template', 'author/login.html')
    form = forms.AuthenticationForm
    redirect = request.GET.get('redirect',
               request.POST.get('redirect',
               kwargs.get('redirect', '')))

    if not is_safe_url(url=redirect, host=request.get_host()):
        redirect = reverse('home')
    if request.user.is_authenticated():
        return HttpResponseRedirect(redirect)

    f = None
    if request.method == "POST":
        f = form(request, data=request.POST)
        if f.is_valid():
            auth_login(request, f.get_user())
            return HttpResponseRedirect(redirect)

    context = {
        'form': f,
        'redirect': redirect,
    }
    return TemplateResponse(request, template_name, context)


def logout(request):
    redirect = request.GET.get('redirect',
               request.POST.get('redirect',
               kwargs.get('redirect', '')))

    if not is_safe_url(url=redirect, host=request.get_host()):
        redirect = reverse('home')
    auth_logout(request)
    return HttpResponseRedirect(redirect)


def register(request, **kwargs):
    template_name = kwargs.get('template', 'author/register.html')
    form = kwargs.get('form', forms.UserCreationForm)

    f = None
    if request.method == "POST":
        f = form(request.POST)
        if f.is_valid():
            f.save()
            return HttpResponseRedirect(reverse('author:login'))

    context = {
        'form': f
    }
    return TemplateResponse(request, template_name, context)
