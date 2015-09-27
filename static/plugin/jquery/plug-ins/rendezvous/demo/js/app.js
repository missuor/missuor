/*www.sucaijiayuan.com*/
SyntaxHighlighter.defaults['toolbar'] = false;
SyntaxHighlighter.all();

/* Configurable Datepicker */
$('#rendez-vous').RendezVous();

/* Default date Datepicker */
$('#rendez-vous-date').RendezVous({
	inputEmptyByDefault: false,
	defaultDate: {
		day: 1,
		month: 1,
		year: 2011
	}
});

/* Custom language Datepicker */
$('#rendez-vous-french').RendezVous({
	i18n: {
		calendar: {
			month: {
				previous: '上一月',
				next:     '下一月',
				up:       '选择月份'
			},
			year: {
				previous: '上一年',
				next:     '下一年',
				up:       '选择年份'
			},
			decade: {
				previous: '上十年',
				next:     '下十年',
				up:       '选择日期'
			}
		},
		days: {
			abbreviation: {
				monday:    '一',
				tuesday:   '二',
				wednesday: '三',
				thursday:  '四',
				friday:    '五',
				saturday:  '六',
				sunday:    '日'
			},
			entire: {
				monday:    '星期一',
				tuesday:   '星期二',
				wednesday: '星期三',
				thursday:  '星期四',
				friday:    '星期五',
				saturday:  '星期六',
				sunday:    '星期日'
			}
		},
		months: {
			abbreviation:
			{
				january:   '一月',
				february:  '二月',
				march:     '三月',
				april:     '四月',
				may:       '五月',
				june:      '六月',
				july:      '七月',
				august:    '八月',
				september: '九月',
				october:   '十月',
				november:  '十一月',
				december:  '十二月'
			},
			entire: {
				january:   '一月',
				february:  '二月',
				march:     '三月',
				april:     '四月',
				may:       '五月',
				june:      '六月',
				july:      '七月',
				august:    '八月',
				september: '九月',
				october:   '十月',
				november:  '十一月',
				december:  '十二月'
			}
		}
	}
});

/* Fullscreen opening Datepicker */
$('#rendez-vous-fullscreen').RendezVous();

/* Custom date format Datepicker */
$('#rendez-vous-format').RendezVous({
	formats: {
		display: {
			date: '%Day %d %Month %Y'
		}
	}
});

/* Input split Datepicker */
$('#rendez-vous-split').RendezVous({
	splitInput: true
});

/* Catch events Datepicker */
$('#rendez-vous-events')
	.on('rendezvous-init', function(event, rdv) {
		console.log('rdv-init');
	})
	.on('rendezvous-open', function(event, rdv) {
		console.log('rdv-open');
	})
	.on('rendezvous-close', function(event, rdv) {
		console.log('rdv-close');
	})
	.on('rendezvous-change', function(event, rdv) {
		console.log('rdv-change');
	})
.RendezVous();

/* Always open Datepicker */
$('#rendez-vous-open').RendezVous({
		canClose: false,
		openByDefault: true
	}
);
/*www.sucaijiayuan.com*/