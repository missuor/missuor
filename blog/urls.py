# coding=utf-8
from django.conf.urls import patterns, include, url

urlpatterns = patterns('',
    url(r'^$', 'blog.views.index', name='index'),
    url(r'^more$', 'blog.views.loadmore', name='loadmore'),
    url(r'^add$', 'blog.views.add', name='add'),
    url(r'^drafts$', 'blog.views.drafts', name='drafts'),
    url(r'^archive$', 'blog.views.archive', name='archive'),
    url(r'^delete/(\w+)$', 'blog.views.delete', name='delete'),
    url(r'^edit/(\w+)$', 'blog.views.edit', name='edit'),
    url(r'^([\w-]+).html$', 'blog.views.detail', name='detail'),

    url(r'^comment/delete$', 'blog.views.delete_comment', name='deletecomment'),
    url(r'^comment/(\w+)$', 'blog.views.add_comment', name='addcomment'),
)
