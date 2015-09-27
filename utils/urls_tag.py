# coding=utf-8
from django.conf.urls import include, url, patterns

urlpatterns = patterns('',
    url(r'^$', 'utils.tags.all', name='home'),
    url(r'^add/$', 'utils.tags.add', name='add'),
    url(r'^delete/$', 'utils.tags.delete', name='delete'),
    url(r'^edit/$', 'utils.tags.edit', name='edit'),
    url(r'^sub/(.*)/$', 'utils.tags.children', name='subtag'),
    url(r'^(.*)/$', 'utils.tags.tag', name='tag'),
)
