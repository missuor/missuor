# coding=utf-8
import os
import datetime
import time
import qiniu
import qiniu.config
import logging
from django.conf import settings
from django.core.cache import cache
from utils import key as _key

logger = logging.getLogger(__name__)

AK = settings.CLOUD_SOTRAGE_AK
SK = settings.CLOUD_SOTRAGE_SK
DOMAIN = settings.CLOUD_SOTRAGE_DOMAIN

def qiniu_upload_content(content, bucket_name, key, mime_type):
    '''
        把content内容上传为七牛文件
        content: str
        bucket_name: 七牛的bucket
        key: 文件名
    '''
    q = qiniu.Auth(AK, SK)
    token = q.upload_token(bucket_name, key)
    ret, info = qiniu.put_data(token, key, content, mime_type=mime_type)
    print 'ret:', ret
    print 'info:', info

def qiniu_upload_fileobj(obj, bucket_name, ext=None):
    '''
        把request.FILES里的文件对象上传到七牛
        obj: 文件对象
        bucket_name: 七牛的bucket
        ext: 为七牛的key追加的扩展名，包含.符号
    '''
    if not ext:
        ext = os.path.splitext(obj.name)[1]

    full_name = '%s/%s%s' % (
        datetime.datetime.now().strftime('%Y%m%d/%H%M%S'),
        _key(10).lower(),
        ext
    )
    q = qiniu.Auth(AK, SK)
    token = q.upload_token(bucket_name, full_name)
    data = ''
    for chunk in obj.chunks():
        data += chunk
    ret, info = qiniu.put_data(token, full_name, data, mime_type=obj.content_type)
    if ret:
        return full_name
    else:
        logger.debug('qiniu upload err: %s', info)


def get_private_url(key, expires=3600):
    if not key:
        return None
    domain = DOMAIN
    base_url = '%s/%s' % (domain, key.split(domain)[-1])
    q = qiniu.Auth(AK, SK)
    private_url = q.private_download_url(base_url, expires)
    cache.set(key, private_url, expires)
    return private_url


if __name__ == '__main__':
    key = '1441611243.994000.png'
    r = get_private_url(key)
    print r
