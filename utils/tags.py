# coding=utf-8
import os
import datetime
import traceback
from django.conf import settings
from django.http import HttpResponse
from django.template.response import TemplateResponse
from django.core.urlresolvers import reverse as django_reverse

from utils import models
from utils import forms
from utils import JsonResponseSuccess, JsonResponseFailure, model_to_dict, key
from utils import paginator


def all(request, *args, **kwargs):
    template_name = kwargs.get('template', 'tags/home.html')
    extra_context = kwargs.get('extra_context', None)

    objs = models.Tag.objects.all().order_by('-count', 'flag')
    context = paginator(request, objs)
    context = {'records': objs}
    return TemplateResponse(request, template_name, context)

def add(request, *args, **kwargs):
    template_name = kwargs.get('template', 'utils/new-tag.html')
    form = kwargs.get('form', forms.TagForm)
    extra_context = kwargs.get('extra_context', None)

    f = None
    if request.method == "POST":
        f = form(request.POST)
        if f.is_valid():
            f.save()
            return HttpResponseRedirect(reverse('tags:all'))
        logger.debug(f.errors)

    current_site = get_current_site(request)
    context = {
        'form': f
    }
    if extra_context and isinstance(extra_context, dict):
        context.update(extra_context)

    return TemplateResponse(request, template_name, context)

def delete(request, *args, **kwargs):
    pass

def edit(request, *args, **kwargs):
    pass

def tag(request, *args, **kwargs):
    template_name = kwargs.get('template', 'blog/index.html')
    extra_context = kwargs.get('extra_context', None)
    tag = args and args[0] or None
    if not tag:
        return HttpResponseRedirect(reverse('tags:all'))
    try:
        o = models.Tag.objects.get(flag=tag)
    except models.Tag.DoesNotExist, e:
        return JsonResponseFailure(msg=u'错误的键', debug=str(e))
    except Exception, e:
        return JsonResponseFailure(msg=u'服务器错误', debug=str(e))

    objs = o.article_set.all().order_by('-create_time')
    context = paginator(request, objs)
    return TemplateResponse(request, template_name, context)

def children(request, *args, **kwargs):
    tag = args and args[0] or None
    if not tag:
        return JsonResponseFailure()

    objs = models.Tag.objects.filter(parent__flag=tag).values_list('flag', flat=True)
    
    return JsonResponseSuccess(choices=list(objs))

