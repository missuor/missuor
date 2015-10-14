# coding=utf-8
import bs4
import MySQLdb
import urllib2
import datetime
import traceback
from multiprocessing import Pool

conn = MySQLdb.connect(
    user='root',
    passwd='pwd',
    host='10.10.10.197',
    port=3100,
    charset='utf8'
)

conn.select_db('missuor')
cursor = conn.cursor()


sql = "INSERT INTO `blog_tip` (`id`, `title`, `content`, `create_time`, `update_time`, `is_publish`, `is_open`, `is_deleted`, `owner_id`) VALUES(%s, %s, %s, '2015-08-07 17:00:00', '2015-08-07 17:00:00', 1,2,0,1);"
sql2 = "INSERT INTO `blog_tip_tags` (`tip_id`, `tag_id`) VALUES(%s, 4);"
N = 0
def save(*args):
    global N
    if N % 100 == 0:
        print 'total: ', N, datetime.datetime.now().strftime('%H:%M:%S')
    N += 1
    try:
        cursor.execute(sql, (N, args[0], args[1]))
        cursor.execute(sql2, [N,])
        conn.commit()
    except:
        pass



def creeper(page):
    base_url = 'http://www.laifudao.com/wangwen/youmoxiaohua.htm'
    url = page == 1 and base_url or base_url.replace('.htm', '_%s.htm' % page)
    try:
        html = urllib2.urlopen(url).read()
    except:
        return
    soup = bs4.BeautifulSoup(html, from_encoding='gbk')
    articles = soup.select('article')

    for art in articles:
        title = art('header')[0]('h1')[0].text
        content = art('div')[0]('section')[0].text.replace(' ', '')
        save(title, content)


def main():
    pool = Pool(processes=10)
    result = pool.map_async(creeper, range(1, 1000)).get(99999999)

if __name__ == '__main__':
    main()
