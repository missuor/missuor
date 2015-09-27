# coding=utf-8
import traceback
from django.conf.urls import include, url, patterns
from django.contrib import admin
from django.conf import settings
from django.views.generic import RedirectView

urlpatterns = patterns('',
    url(r'^$', 'Missuor.views.index', name='home'),
    url(r'^favicon\.ico$', RedirectView.as_view(url='/static/img/favicon.ico')),
    url(r'^admin/', include(admin.site.urls)),

)


urlpatterns += patterns('',
    url(r'^auth/', include('author.urls', namespace='author')),
    url(r'^blog/', include('blog.urls', namespace='blog')),
    url(r'^utils/', include('utils.urls', namespace='utils')),
    url(r'^tag/', include('utils.urls_tag', namespace='tags')),
    url(r'', include('storage.urls', namespace='storage')),
)

urlpatterns += patterns('',
    url(r'^logs/(?P<path>.*)$', 'django.views.static.serve',
        { 'document_root': settings.LOG_DIR,
    }),
)

urlpatterns += patterns('',
    url(r'^blogs$', 'blog.views.index', name='blogs'),
    url(r'^demo/(?P<template>.*)$', 'utils.views.demo', name='demo'),
)