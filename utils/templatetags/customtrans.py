# coding=utf-8
import markdown
from django import template
from utils import markdowncode
from django.core.cache import cache
from django.conf import settings

domain = settings.CLOUD_SOTRAGE_DOMAIN

register = template.Library()

@register.filter(name='md')
def do_markdown(value):
    ext = markdowncode.CodeExtension()
    return markdown.markdown(value, extensions=[ext])

@register.filter(name='u')
def private_url(url):
    cached_url = cache.get(url)
    if cached_url:
        return cached_url
    if len(url.split('!')) < 2:
        return ''
    return '%s/%s' % (domain, url)

