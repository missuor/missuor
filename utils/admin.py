# coding=utf-8
from django.contrib import admin
from utils import models


class TagAdmin(admin.ModelAdmin):
    pass

admin.site.register(models.Tag, TagAdmin)