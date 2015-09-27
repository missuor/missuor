# coding=utf-8
import datetime
from PIL import Image, ImageDraw, ImageFont
from django.http.response import HttpResponse
from django.conf import settings
import cStringIO, string, os, random

def captcha(request):
    '''Captcha'''
    image = Image.new(
        'RGB', 
        (150, 80), 
        color = (255, 255, 255)
    ) # model, size, background color
    font_file = os.path.join(settings.BASE_DIR, 'static/common/fonts/FREESCPT.TTF') # choose a font file
    font = ImageFont.truetype(font_file, 50) # the font object
    draw = ImageDraw.Draw(image)
    rand_str = ''.join(random.sample(string.letters + string.digits, 4)) # The random string
    draw.text((7, 0), rand_str, fill=(0, 0, 0), font=font) # position, content, color, font
    del draw
    request.session['captcha'] = rand_str.lower() # store the content in Django's session store
    buf = cStringIO.StringIO() # a memory buffer used to store the generated image
    image.save(buf, 'jpeg')
    # return the image data stream as image/jpeg format, browser will treat it as an image
    return HttpResponse(buf.getvalue(), 'image/jpeg')
