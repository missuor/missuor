# coding=utf-8

import re
import traceback
from markdown.extensions import Extension
from markdown.preprocessors import Preprocessor
from django.core.urlresolvers import reverse

from blog import models

regx = r'\{\{[ ]?code:[ ]?"(\w+)"[ ]?\}\}'

def _md(line):
    def __f(*args):
        s = line
        url = reverse('blog:viewcode')
        try:
            o = models.Code.objects.get(pk=args[0])
            s = """
            <div><pre name="code" class="brush: %s">%s</pre></div>
            """ % (o.ext, o.content)
        except:
            traceback.print_exc()
            return

        return s

    return re.sub(regx, lambda m: m.groups() and __f(*m.groups()) or line, line)



class CodePreprocessor(Preprocessor):

    def run(self, lines):
        return map(lambda line: _md(line), lines)

class CodeExtension(Extension):
    def __init__(self, configs={}):
        self.config = configs

    def extendMarkdown(self, md, md_globals):
        ##注册扩展，用于markdown.reset时扩展同时reset
        md.registerExtension(self)

        ##设置Preprocessor
        p = CodePreprocessor()
        #print md.preprocessors.keys()
        md.preprocessors.add('codepreprocessor', p, '<normalize_whitespace')

        ##print md_globals   ##markdown全局变量
