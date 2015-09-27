# coding=utf-8
from django import forms
from utils import models


class UploadFileForm(forms.Form):
    title = forms.CharField(max_length=50)
    file = forms.FileField()

class TagForm(forms.ModelForm):
    class Meta:
        model = models.Tag
        fields = ('flag', 'parent')