# coding=utf-8
from django.contrib.auth import get_user_model

UserModel = get_user_model()

def save_user(request, user):
    request.session['current_user'] = user.pk

def get_user(request):
    try:
        uid = request.session.get('current_user')
        if uid:
            user = UserModel.objects.get(pk=uid)
            return user
        return None
    except:
        return None

def clear_user(request):
    if hasattr(request, 'current_user') and request.current_user:
        request.current_user = None
        delattr(request, 'current_user')
    if request.session.get('current_user'):
        del request.session['current_user']
    