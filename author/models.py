# coding=utf-8
from django.db import models
from django.contrib.auth import models as auth_models

class User(auth_models.AbstractUser):
    """
    django.contrib.auth.User 的一个扩展,扩展一些自定义的字段.
    """
    qq = models.CharField(max_length=30, blank=True, null=True)
    tel = models.CharField(max_length=20, blank=True, null=True)
    avatar = models.ImageField(upload_to='.', blank=True, null=True)

    def __unicode__(self):
        return self.username