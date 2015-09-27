# coding=utf-8
from django.conf.urls import include, url, patterns

urlpatterns = patterns('',
    url(r'^key/$', 'utils.views.get_key', name='key'),
    url(r'^ajaxUpload/$', 'utils.views.file_uploader', name='ajaxUpload'),
    url(r'^reverse/$', 'utils.views.reverse', name='reverse'),
    url(r'^captcha/$', 'utils.captcha.captcha'),  
)
