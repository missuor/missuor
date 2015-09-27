#!/usr/bin/env python
# -*- coding: utf-8 -*

import re
from math import sqrt
#You have to install the python lib
import jieba

def file_reader(filename,filename2):
    file_words = {}
    ignore_list = [u'的',u'了',u'和',u'呢',u'啊',u'哦',u'恩',u'嗯',u'吧'];
    accepted_chars = re.compile(ur"[\u4E00-\u9FA5]+")

    file_object = filename

    try:
        all_the_text = file_object
        seg_list = jieba.cut(all_the_text, cut_all=True)
        for s in seg_list:
            if accepted_chars.match(s) and s not in ignore_list:
                if s not in file_words.keys():
                    file_words[s] = [1,0]
                else:
                    file_words[s][0] += 1

    except:
        pass
    file_object2 = filename2

    try:
        all_the_text = file_object2
        seg_list = jieba.cut(all_the_text, cut_all=True)
        for s in seg_list:
            if accepted_chars.match(s) and s not in ignore_list:
                if s not in file_words.keys():
                    file_words[s] = [0,1]
                else:
                    file_words[s][1] += 1

    except:
        pass
    sum_2 = 0
    sum_file1 = 0
    sum_file2 = 0
    for word in file_words.values():
        sum_2 += word[0]*word[1]
        sum_file1 += word[0]**2
        sum_file2 += word[1]**2

    rate = sum_2/(sqrt(sum_file1*sum_file2))
    print 'rate: '
    print rate

s1 = """余争的其他代码
更快速、准确、简单的中文摘要实现
(0评/718阅,2年前)
一个Softmax示例
(0评/211阅,2年前)
google百度等搜索中的词语纠错功能实现
(0评/795阅,2年前)
简单的最大概率分词实现C++版（网上抄的）
(0评/686阅,2年前)
文章或博客的自动摘要(自动简介)
(9评/1527阅,2年前)
全部(12)..."""

s2 = """
只将汉字作为向量，其他的如标点，数字等符号不处理；2. 在HashMap中存放汉字和其在文本中对于的个数时，先将单个汉字通过GB2312编码转换成数字，再存放。
最后写了个测试，根据两种不同的算法对比下时间，下面是测试结果：
余弦定理算法：doc1 与 doc2 相似度为：0.9954971, 耗时：22mm
距离编辑算法：doc1 与 doc2 相似度为：0.99425095, 耗时：322m
"""



file_reader(s1, s2)