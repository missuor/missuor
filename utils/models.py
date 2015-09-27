# coding=utf-8
from django.db import models


class Tag(models.Model):
    flag = models.CharField(max_length=30)
    create_time = models.DateTimeField(auto_now_add=True)
    count = models.IntegerField(default=0)
    parent = models.ForeignKey('self', blank=True, null=True)

    def __unicode__(self):
        return self.flag
