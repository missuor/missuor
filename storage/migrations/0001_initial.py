# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import utils


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Storage',
            fields=[
                ('id', models.CharField(default=utils.pk_6, max_length=40, serialize=False, primary_key=True)),
                ('domain', models.CharField(default=b'http://q.missuor.com', max_length=200)),
                ('url', models.CharField(max_length=200)),
                ('hash', models.CharField(max_length=200, null=True, blank=True)),
                ('ref', models.IntegerField(default=0)),
            ],
        ),
    ]
