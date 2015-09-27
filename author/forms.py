# coding=utf-8
from django import forms
from django.contrib.auth import forms as auth_forms
from django.utils.translation import ugettext, ugettext_lazy as _
from author import models


class AuthenticationForm(auth_forms.AuthenticationForm):
    pass

class UserCreationForm(auth_forms.UserCreationForm):
    qq = forms.CharField(label=_("QQ"), max_length=30, required=False)
    tel = forms.CharField(label=_("Phone Number"), max_length=20, required=False)
    avatar = forms.ImageField(label=_("Photo"), required=False)
    
    class Meta:
        model = models.User
        fields = ('username',)