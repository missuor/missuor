# coding=utf-8
import logging
from django.template.response import TemplateResponse

from blog import models

logger = logging.getLogger(__name__)


def index(request, *args, **kwargs):
    template_name = kwargs.get('template', 'common/index.html')
    objs = models.Article.objects.filter(is_publish=True).order_by('-create_time')[:5]
    return TemplateResponse(request, template_name, {'objs': objs})
