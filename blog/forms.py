# coding=utf-8
from django import forms
from django.contrib.auth import forms as auth_forms
from django.utils.translation import ugettext, ugettext_lazy as _
from blog import models
from utils import models as utils_models


class ArticleForm(forms.ModelForm):
    tags = forms.CharField(max_length=512, required=False)
    # cover = forms.CharField(max_length=200, required=False)
    entryname = forms.CharField(max_length=150, required=False)

    def clean_tags(self):
        tags = self.cleaned_data["tags"]
        tags = tags.replace(' ', '').split(',')
        objs_lst = []
        for flag in tags:
            flag = flag.replace(' ', '')
            if not flag:
                continue
            flags = [flag, flag.capitalize(), flag.lower(), flag.upper()]
            objs = utils_models.Tag.objects.filter(flag__in=flags)
            if objs.exists():
                objs_lst.append(objs[0])
                continue

            o, is_new = utils_models.Tag.objects.get_or_create(flag=flag)
            objs_lst.append(o)

        return objs_lst

    def clean(self, *args, **kwargs):
        super(ArticleForm, self).clean(*args, **kwargs)
        entryname = self.cleaned_data["entryname"]
        if entryname:
            objs = models.Article.objects.filter(entryname=entryname)
            if not self.instance._state.adding:
                objs = objs.exclude(pk=self.instance.pk)
            if objs.exists():
                self.add_error('entryname', u'名称已存在.')

        return self.cleaned_data

    def save(self, *args, **kwargs):
        o = super(ArticleForm, self).save(*args, **kwargs)
        tags = self.cleaned_data['tags']
        for tag in tags:
            tag.count += 1
            tag.save()
            o.tags.add(tag)
        return o


    class Meta:
        model = models.Article
        fields = ('owner', 'title', 'cover', 'content', 'tags', 'is_publish', 'is_open', 'excerpt', 'entryname')


class CommentForm(forms.ModelForm):
    class Meta:
        model = models.Comment
        fields = ('owner', 'ip', 'to', 'email', 'article', 'content', 'parent')

