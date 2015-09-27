# coding=utf-8
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from author import models

# Register your models here.
class UserAdmin(UserAdmin):
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'username', 
                'password1', 
                'password2',
                'qq',
                'tel',
                'avatar'
            ),
        }),
    )
    # 显示的字段
    list_display = (
        'username', 
        'email', 
        'first_name', 
        'last_name', 
        'is_staff',
        'qq', 'tel', 'avatar'
    )

admin.site.register(models.User, UserAdmin)