# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import utils
import django.db.models.deletion
from django.conf import settings
import django.core.validators


class Migration(migrations.Migration):

    dependencies = [
        ('utils', '0001_initial'),
        ('storage', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Article',
            fields=[
                ('id', models.CharField(default=utils.pk_32, max_length=40, serialize=False, primary_key=True)),
                ('title', models.CharField(max_length=50)),
                ('content', models.TextField()),
                ('entryname', models.CharField(blank=True, max_length=150, null=True, validators=[django.core.validators.RegexValidator(b'^[\\w-]+$', 'Enter a valid entryname. This value may contain only letters, numbers and - characters.', b'invalid')])),
                ('excerpt', models.CharField(max_length=200)),
                ('readnum', models.IntegerField(default=0)),
                ('create_time', models.DateTimeField(auto_now_add=True)),
                ('update_time', models.DateTimeField(auto_now=True)),
                ('is_publish', models.BooleanField(default=True)),
                ('is_open', models.BooleanField(default=True)),
                ('is_deleted', models.BooleanField(default=False)),
                ('cover', models.ForeignKey(on_delete=django.db.models.deletion.SET_NULL, blank=True, to='storage.Storage', null=True)),
                ('followers', models.ManyToManyField(related_name='followers', to=settings.AUTH_USER_MODEL)),
                ('owner', models.ForeignKey(blank=True, to=settings.AUTH_USER_MODEL, null=True)),
                ('tags', models.ManyToManyField(to='utils.Tag', blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='Comment',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('content', models.CharField(max_length=512)),
                ('create_time', models.DateTimeField(auto_now_add=True)),
                ('ip', models.GenericIPAddressField(null=True, unpack_ipv4=True, blank=True)),
                ('to', models.CharField(max_length=40, null=True, blank=True)),
                ('email', models.EmailField(max_length=254, null=True, verbose_name='email address', blank=True)),
                ('deleted', models.BooleanField(default=False)),
                ('article', models.ForeignKey(to='blog.Article')),
                ('owner', models.ForeignKey(blank=True, to=settings.AUTH_USER_MODEL, null=True)),
                ('parent', models.ForeignKey(related_name='child_set', blank=True, to='blog.Comment', null=True)),
            ],
        ),
    ]
