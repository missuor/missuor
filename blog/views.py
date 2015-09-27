# coding=utf-8
import traceback
import logging
from markdown import markdown
from django.conf import settings
from django.core.cache import cache
from django.core.urlresolvers import reverse
from django.http import HttpResponse, HttpResponseRedirect
from django.template.response import TemplateResponse
from django.core.urlresolvers import reverse as django_reverse
from django.contrib.sites.shortcuts import get_current_site

from author import decorator
from blog import models, forms
from utils import models as utils_models
from utils import paginator
from utils import JsonResponseSuccess, JsonResponseFailure, get_ip

logger = logging.getLogger(__name__)


def index(request, *args, **kwargs):
    template_name = kwargs.get('template', 'blog/index.html')
    objs = models.Article.objects.filter(is_publish=True).order_by('-create_time')
    context = paginator(request, objs)
    return TemplateResponse(request, template_name, context)

def loadmore(request, *args, **kwargs):
    template_name = kwargs.get('template', 'blog/loadmore.html')
    objs = models.Article.objects.filter(is_publish=True).order_by('-create_time')
    context = paginator(request, objs)
    return TemplateResponse(request, template_name, context)


@decorator.login_required
def add(request, *args, **kwargs):
    is_ajax = request.is_ajax()
    redirect = request.GET.get('redirect', reverse('blog:index'))
    template_name = kwargs.get('template', 'blog/new.html')
    form = kwargs.get('form', forms.ArticleForm)

    f = None
    if request.method == 'POST':
        pk = request.POST.get('pk', None)
        if pk:
            try:
                obj = models.Article.objects.get(pk=pk)
                f = form(request.POST, instance=obj)
            except Exception, e:
                logger.debug(f.errors)
                if is_ajax:
                    return JsonResponseFailure(reason=str(e))
                raise
        else:
            f = form(request.POST)
        if f.is_valid():
            f.save()
            if is_ajax:
                return JsonResponseSuccess(redirect=redirect)
            return HttpResponseRedirect(redirect)

        if is_ajax:
            return JsonResponseFailure(errors=f.errors, fields=f.fields.keys())
    user = request.user
    drafts = models.Article.objects.filter(is_publish=False, owner=user)
    content = {
        'form': f,
        'drafts': drafts.count()
    }
    return TemplateResponse(request, template_name, content)

def delete(request, *args, **kwargs):
    is_ajax = request.is_ajax()
    redirect = request.GET.get('redirect', reverse('blog:index'))

    try:
        pk = args[0]
        o = models.Article.objects.get(pk=pk)
        o.delete()
    except Exception, e:
        if is_ajax:
            return JsonResponseFailure(reason=str(e))
        raise

    if is_ajax:
        return JsonResponseSuccess(redirect=redirect)
    return HttpResponseRedirect(redirect)

def edit(request, *args, **kwargs):
    is_ajax = request.is_ajax()
    template_name = kwargs.get('template', 'blog/new.html')
    form = kwargs.get('form', forms.ArticleForm)

    try:
        pk = args[0]
        o = models.Article.objects.get(pk=pk)
    except Exception, e:
        if is_ajax:
            return JsonResponseFailure(reason=str(e))
        raise

    if request.method == "POST":
        f = form(request.POST, instance=o)
        redirect = reverse('blog:index')
        if f.is_valid():
            f.save()
            if is_ajax:
                return JsonResponseSuccess(redirect=redirect)
            return HttpResponseRedirect(redirect)

        logger.debug(f.errors)
        if is_ajax:
            return JsonResponseFailure(errors=f.errors, fields=f.fields.keys())
    else:
        f = form(instance=o)

    content = {
        'form': f,
        'drafts': models.Article.objects.filter(is_publish=False).count()
    }
    return TemplateResponse(request, template_name, content)

def detail(request, *args, **kwargs):
    template_name = kwargs.get('template', 'blog/details.html')

    try:
        pk = args[0]
        try:
            o = models.Article.objects.get(pk=pk)
        except:
            o = models.Article.objects.get(entryname=pk)

    except Exception, e:
        raise

    if request.user != o.owner:
        cache_key = '%s::%s' % (request.ip, pk)
        has_read = cache.get(cache_key)
        if not has_read:
            cache.set(cache_key, True, 60*60)
            o.readnum += 1
            o.save()

    return TemplateResponse(request, template_name, {'o': o})


def add_comment(request, *args, **kwargs):
    form = kwargs.get('form', forms.CommentForm)
    redirect = request.POST.get('redirect', request.path)
    if request.method == 'POST':
        f = form(request.POST)
        if f.is_valid():
            f.save()
            return HttpResponseRedirect(redirect)
    return HttpResponse('failure%s' % str(f.errors))

def delete_comment(request):
    pk = request.GET.get('id', None)
    if not pk:
        return JsonResponseFailure()
    try:
        obj = models.Comment.objects.get(pk=pk)
        obj.deleted = True
        obj.save()
    except Exception, e:
        return JsonResponseFailure(reason=str(e))
    return JsonResponseSuccess(msg='111111')


@decorator.login_required
def drafts(request, *args, **kwargs):
    template_name = kwargs.get('template', 'blog/drafts.html')
    user = request.user
    objs = models.Article.objects.filter(
        is_publish=False,
        owner=user
    ).order_by('-create_time')
    context = paginator(request, objs)
    return TemplateResponse(request, template_name, context)

def archive(request, *args, **kwargs):
    template_name = kwargs.get('template', 'blog/archive.html')
    objs = models.Article.objects.filter(is_publish=True).order_by('-create_time')
    context = paginator(request, objs)
    return TemplateResponse(request, template_name, context)
