# coding=utf-8
import traceback
import datetime
from django.db import models
from utils import pk_32
from django.core.urlresolvers import reverse
from django.core import validators
from django.utils.translation import ugettext_lazy as _
from django.core.exceptions import ValidationError


def validator_unique_if_not_null(value):
    if value:
        objs = Article.objects.filter(entryname=value)
        if objs.exists():
            raise ValidationError('%s is already in use' % value)

class Article(models.Model):
    id = models.CharField(primary_key=True, default=pk_32, max_length=40)
    title = models.CharField(max_length=50)
    content = models.TextField()

    entryname = models.CharField(max_length=150,
        blank=True, null=True,
        validators=[
            validators.RegexValidator(r'^[\w-]+$',
                                      _('Enter a valid entryname. '
                                        'This value may contain only letters, numbers '
                                        'and - characters.'), 'invalid'),
            # validator_unique_if_not_null
        ])
    excerpt = models.CharField(max_length=200)
    readnum = models.IntegerField(default=0)

    create_time = models.DateTimeField(auto_now_add=True)
    update_time = models.DateTimeField(auto_now=True)
    is_publish = models.BooleanField(default=True)
    is_open = models.BooleanField(default=True)
    is_deleted = models.BooleanField(default=False)

    cover = models.ForeignKey('storage.Storage', blank=True, null=True, on_delete=models.SET_NULL)
    owner = models.ForeignKey('author.User', blank=True, null=True)
    tags = models.ManyToManyField('utils.Tag', blank=True)
    followers = models.ManyToManyField('author.User', related_name='followers')

    def __unicode__(self):
        return self.title

    @property
    def commentnum(self):
        return self.comment_set.filter(deleted=False).count()

    @property
    def replies(self):
        return self.comment_set.all().filter(parent__isnull=True, deleted=False)

    @property
    def url(self):
        return self.entryname or self.pk

class Comment(models.Model):
    content = models.CharField(max_length=512)
    create_time = models.DateTimeField(auto_now_add=True)
    owner = models.ForeignKey('author.User', blank=True, null=True)
    ip = models.GenericIPAddressField(unpack_ipv4=True, blank=True, null=True)
    to = models.CharField(max_length=40, blank=True, null=True)
    email = models.EmailField(_('email address'), blank=True, null=True)
    article = models.ForeignKey('Article')
    parent = models.ForeignKey('self', related_name='child_set', blank=True, null=True)
    deleted = models.BooleanField(default=False)

    def __unicode__(self):
        return self.content

    @property
    def user(self):
        return self.owner or self.ip or 'Someone'

    @property
    def replyto(self):
        return self.to or self.parent.ip or 'Someone'

    @property
    def time(self):
        delta = datetime.datetime.now() - self.create_time.replace(tzinfo=None)
        days =  delta.days
        seconds = delta.seconds
        hour = seconds / 3600
        min = seconds % 3600 / 60
        sec = seconds % 60
        if 0 < days < 8:
            return  u'%s 天前' % days
        if seconds < 60:
            return u'%s 秒前' % (seconds + 1)
        elif seconds < 3600:
            return u'%s 分钟前' % min
        elif 3600 < seconds < 3600 * 24:
            return u'今天 %s' % self.create_time.strftime('%H:%M')
        else:
            return self.create_time.strftime('Y-m-d H:i')

    @property
    def replies(self):
        objs = self.child_set.filter(deleted=False)
        for o in objs[:]:
            if objs.count() > 5:
                return objs
            if o.replies.exists():
                objs |= o.replies

        return objs
