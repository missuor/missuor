# coding=utf-8
import datetime
import traceback
from django.conf import settings
from django.utils.dateparse import parse_date as dj_parse_date
from django.utils.dateparse import parse_time as dj_parse_time
from django.utils.dateparse import parse_datetime as dj_parse_datetime

from xlrd import xldate_as_tuple

DEBUG = settings.DEBUG
del settings


def parse_dater(value, datemode=0):
    try:
        if isinstance(value, (str, unicode)):
            return dj_parse_date(value)
        elif isinstance(value, float):
            return datetime.datetime.strptime(str(int(value)), '%Y%m%d').date()
        else:
            return None
    except:
        if DEBUG:
            traceback.print_exc()
        return None


def parse_timer(value, datemode=0):
    try:
        if isinstance(value, (str, unicode)):
            return dj_parse_time(value)
        elif isinstance(value, float):
            args = xldate_as_tuple(value, datemode)
            return datetime.time(args[3], args[4], args[5])
        else:
            return None
    except:
        if DEBUG:
            traceback.print_exc()
        return None


def excel_float_to_date(f, datemode=0):
    if f > 1:
        return datetime.datetime.strptime(str(int(f)), '%Y%m%d').date()
    else:
        args = xldate_as_tuple(f, datemode)
        return datetime.time(args[3], args[4], args[5])



def _test():
    __lst = (
        '20100101',
        '2001-01-01',
    )











if __name__ == '__main__':
    _test()