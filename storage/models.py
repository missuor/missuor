# coding=utf-8
from django.db import models
from django.conf import settings
from django.core.cache import cache
from utils import pk_6


class Storage(models.Model):
    id = models.CharField(primary_key=True, default=pk_6, max_length=40)
    domain = models.CharField(max_length=200, default=settings.CLOUD_SOTRAGE_DOMAIN)
    url = models.CharField(max_length=200)
    hash = models.CharField(max_length=200, blank=True, null=True)
    ref = models.IntegerField(default=0)

    def __unicode__(self):
        return self.url

    @property
    def path(self):
        return '%s/%s' % (self.domain, self.url)