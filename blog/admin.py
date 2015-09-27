# coding=utf-8
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from blog import models

# Register your models here.
class ArticleAdmin(admin.ModelAdmin):
    pass

class CommentAdmin(admin.ModelAdmin):
    pass



admin.site.register(models.Article, ArticleAdmin)
admin.site.register(models.Comment, CommentAdmin)