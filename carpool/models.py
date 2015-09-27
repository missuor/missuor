# coding=utf-8
from django.db import models


class CUP(models.Model): # CarpoolUserProfile
    user = models.OneToOneField('author.User')
    nickname = models.CharField(max_length=30, blank=True, null=True)
    carcode = models.CharField(max_length=30, blank=True, null=True)


class CarpoolInfo(models.Model):
    CARPOOL_STATUS = (
        # TODO
    )
    create_time = models.DateTimeField(auto_now_add=True)
    update_time = models.DateTimeField(auto_now=True)
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()
    status = models.CharField(max_length=30, choices=CARPOOL_STATUS)
    owner = models.ForeignKey('author.User')
    quota = models.IntegerField(default=0)
    origin = models.ForeignKey('author.City', related_name='ori_set')
    destination = models.ForeignKey('author.City', related_name='des_set')
    remark = models.CharField(max_length=256, blank=True, null=True)
    price = models.IntegerField(default=0)


class FollowInfo(models.Model):
    FOLLOW_STATUS = (
        # TODO
    )
    carpool = models.ForeignKey('CarpoolInfo')
    follower = models.ForeignKey('author.User')
    passengers = models.IntegerField(default=1)
    create_time = models.DateTimeField(auto_now_add=True)
    update_time = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=30, choices=FOLLOW_STATUS)
    remark = models.CharField(max_length=256, blank=True, null=True)

