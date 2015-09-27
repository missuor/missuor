# coding=utf-8
from django.conf import settings

from storage import models
from utils import JsonResponseSuccess, JsonResponseFailure, md5_file, handle_uploaded_file
from utils.storage import qiniu_upload_fileobj

domain = settings.CLOUD_SOTRAGE_DOMAIN
bucket = settings.CLOUD_SOTRAGE_BUCKET

def file_uploader(request):
    try:
        blob = request.FILES['img']
        url = qiniu_upload_fileobj(blob, bucket, '.png')
        # md5 = md5_file(blob)
        md5 = 'hash'
        obj, is_new = models.Storage.objects.get_or_create(
            domain=domain,
            url=url,
            hash=md5
        )

        return JsonResponseSuccess(url=obj.path, pk=obj.pk)
    except Exception, e:
        return JsonResponseFailure(reason=str(e))