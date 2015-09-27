# coding=utf-8
import os
import json
import uuid
import decimal
import logging
import datetime
import mimetypes
from hashlib import md5
from wsgiref.util import FileWrapper
from django.http import HttpResponse
from django.utils.http import urlquote
from django.forms.models import model_to_dict as django_model_to_dict
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.conf import settings
DEBUG = settings.DEBUG
del settings


def key(length=6):
    base = list('abcdefghijklmbopqrstuvwxyzABCDEFGHIJKLMBOPQRSTUVWXYZ0123456789')
    seed = ''.join([str(uuid.uuid4()).replace('-', '').lower()
        for i in range(length*4/32+1)])
    lst = []
    for i in range(length):
        sub_str = seed[i*4:i*4+4]
        x = int(sub_str, 16)
        lst.append(base[x % 62])
    return ''.join(lst)

def pk_6(): return key(6).lower()
def pk_32(): return key(32).lower()

def md5_file(full_file_path):
    m = md5()
    with open(full_file_path, 'rb') as file_obj:
        m.update(file_obj.read())
        file_obj.close()
        return m.hexdigest()

def handle_uploaded_file(file):
    full_path = ''
    try:
        timestamp = datetime.datetime.now().strftime('/%Y/%m/%d/')
        path = os.path.join(settings.MEDIA_ROOT, timestamp)
        if not os.path.exists(path):
            os.makedirs(path)

        full_path = path + file.name
        destination = open(full_path, 'wb+')
        for chunk in file.chunks():
            destination.write(chunk)
        destination.close()
    except:
        traceback.print_exc()

    return full_path

def JsonResponseFailure(**kwargs):
    if not DEBUG and 'debug' in kwargs:
        del kwargs['debug']
    ret = {'status': 'failure'}
    ret.update(kwargs)
    return ret

def JsonResponseSuccess(**kwargs):
    if not DEBUG and 'debug' in kwargs:
        del kwargs['debug']
    ret = {'status': 'success', 'success': 'true'}
    ret.update(kwargs)
    return ret

def model_to_dict(instance, max_depth=5, depth=0):
    if isinstance(instance, dict):
        return instance
    if not hasattr(instance, '_meta'):
        return None

    opts = instance._meta
    depth += 1
    data = django_model_to_dict(instance)

    for field_name in opts.get_all_field_names():
        _cached_key = '_%s_cache' % field_name
        field = opts.get_field_by_name(field_name)[0]
        if field.__class__.__name__ in ('DateTimeField', 'DateField',
                                        'TimeField'):
            value = getattr(instance, field_name)
            data[field_name] = None
            if value:
                if field.__class__.__name__ == 'DateTimeField':
                    data[field_name] = value.strftime('%Y-%m-%d %H:%M:%S')
                else:
                    data[field_name] = value.isoformat()
        elif field.__class__.__name__ == 'ForeignKey':
            if _cached_key in instance.__dict__:
                if depth >= max_depth:
                    continue
                data[field_name] = {}
                try:
                    value = getattr(instance, field_name)
                except (ObjectDoesNotExist, AttributeError):
                    continue
                data[field_name] = model_to_dict(value, depth=depth)
        elif field.__class__.__name__ in ('RelatedObject', 'ManyToManyField'):
            if field_name in data:
                del data[field_name]
        else:
            data[field_name] = field.value_from_object(instance)

    return data

def model_list_to_dict(instances, max_depth=2, depth=0):
    _list = []

    for instance in instances:
        _list.append(model_to_dict(instance, max_depth=max_depth, depth=depth))

    return _list

def paginator(request, objs, **kwargs):
    """
    封装Django的翻页插件
    """
    SIZE = 5
    LENG = 5

    try:
        page = int(request.GET.get('p', 1))
    except:
        page = 1

    try:
        size = int(request.GET.get('s'))
    except:
        size = SIZE

    p = Paginator(objs, size)
    try:
        records = p.page(page)
    except PageNotAnInteger:
        page = 1
        records = p.page(1)
    except EmptyPage:
        page = p.num_pages
        # records = p.page(p.num_pages)
        records = objs.none()
    except:
        page = 1
        records = p.page(1)


    s = page % LENG and page - page % LENG + 1 or page - (LENG - 1)
    lst = [s]
    for i in range(s+1, p.num_pages+1):
        lst.append(i)
        if len(lst) == LENG:
            break

    data={
        'page': page,
        'size': size,
        'has_previous': p.page(s).has_previous(),
        'has_next': p.page(lst[-1]).has_next(),
        'previous': s - 1,
        'next': lst[-1] + 1,
        'pages': lst,
        'records': records,
    }
    data.update(kwargs)
    return data


def get_ip(request):
    if 'HTTP_X_FORWARDED_FOR' in request.META:
        return request.META['HTTP_X_FORWARDED_FOR']
    return request.META['REMOTE_ADDR']