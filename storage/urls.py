# coding=utf-8
from django.conf.urls import patterns, include, url

urlpatterns = patterns('storage.views',
    url(r'^ajax-upload/$', 'file_uploader', name='upload'),
)
