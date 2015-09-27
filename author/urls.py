# coding=utf-8
from django.conf.urls import patterns, include, url

urlpatterns = patterns('',
    url(r'^register/$', 'author.views.register', name='register'),
    url(r'^login/$', 'author.views.login', name='login'),
    url(r'^logout/$', 'author.views.logout', name='logout'),
    url(r'^password-reset/$',   'author.views.login', name='password_reset'),
)

