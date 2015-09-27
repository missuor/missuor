# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Tag',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('flag', models.CharField(max_length=30)),
                ('create_time', models.DateTimeField(auto_now_add=True)),
                ('count', models.IntegerField(default=0)),
                ('parent', models.ForeignKey(blank=True, to='utils.Tag', null=True)),
            ],
        ),
    ]
