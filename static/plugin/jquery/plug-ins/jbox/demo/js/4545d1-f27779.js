var noticeN3Volume = 100;
function setN3Volume(vol) {
    noticeN3Volume = vol;
    jQuery('.jBoxN3-volume').removeClass('active');
    jQuery('#jBoxN3-volume' + vol).addClass('active');
}
jQuery(document).ready(function() {
    new jBox('Image');
    new jBox('Image', {
        attach: jQuery('[data-jbox-image-white]'),
        gallery: 'data-jbox-image-white',
        theme: 'ImageWhite'
    });
    new jBox('Tooltip', {
        id: 'jBoxT1',
        attach: jQuery('#demoT1'),
        zIndex: 8000,
        content: 'This is a basic jBox tooltip'
    });
    new jBox('Tooltip', {
        id: 'jBoxT2',
        theme: 'TooltipBorder',
        width: 200,
        position: {
            x: 'left',
            y: 'center'
        },
        outside: 'x',
        pointer: 'top:15',
        attach: jQuery('#demoT2'),
        zIndex: 8000,
        content: 'You have many options to position and animate your jBoxes',
        animation: 'move'
    });
    new jBox('Tooltip', {
        id: 'jBoxT3',
        theme: 'TooltipDark',
        animation: 'zoomOut',
        attach: jQuery('#demoT3'),
        zIndex: 8000,
        content: 'Use themes to change appearance'
    });
    jQuery('#demoT4').mouseenter(function() {
        jQuery('#demoT4').addClass('active').html('Wait...');
    }).mouseleave(function() {
        jQuery('#demoT4').addClass('active').html('Wait...');
    });
    new jBox('Tooltip', {
        id: 'jBoxT4',
        width: 300,
        pointer: 'right:80',
        animation: 'move',
        delayOpen: 1000,
        delayClose: 2000,
        attach: jQuery('#demoT4'),
        zIndex: 8000,
        content: 'This tooltip waits 1 second to open and closes after 2 seconds',
        onOpen: function() {
            jQuery('#demoT4').removeClass('active').html('Hover me!');
        },
        onClose: function() {
            jQuery('#demoT4').removeClass('active').html('Hover me!');
        }
    });
    new jBox('Mouse', {
        id: 'jBoxT5',
        attach: jQuery('#demoT5'),
        zIndex: 8000,
        content: 'I will follow you!'
    });
    new jBox('Tooltip', {
        id: 'jBoxT6',
        width: 280,
        closeOnMouseleave: true,
        animation: 'zoomIn',
        attach: jQuery('#demoT6'),
        zIndex: 8000,
        content: 'I won\'t close when you move your mouse over me'
    });
    new jBox('Tooltip', {
        id: 'jBoxT7',
        theme: 'TooltipBorder',
        trigger: 'click',
        adjustDistance: {
            top: 55,
            right: 5,
            bottom: 5,
            left: 5
        },
        adjustTracker: true,
        closeOnClick: 'body',
        closeButton: 'box',
        animation: 'move',
        attach: jQuery('#demoT7'),
        target: jQuery('#demoT1'),
        zIndex: 8000,
        position: {
            x: 'left',
            y: 'top'
        },
        outside: 'y',
        pointer: 'left:20',
        offset: {
            x: 25
        },
        content: 'You can position your tooltips at any element.<br>Scroll up and down to see this tooltip flip position!',
        onOpen: function() {},
        onOpen: function() {
            jQuery('#demoT7').addClass('active').html('Now scroll!');
        },
        onClose: function() {
            jQuery('#demoT7').removeClass('active').html('Click me!');
        }
    });
    new jBox('Tooltip', {
        id: 'jBoxT8',
        theme: 'TooltipBorder',
        trigger: 'click',
        width: 200,
        height: 600,
        adjustTracker: true,
        adjustDistance: {
            top: 55,
            right: 5,
            bottom: 5,
            left: 5
        },
        closeOnClick: 'body',
        closeOnEsc: true,
        animation: 'move',
        attach: jQuery('#demoT8'),
        zIndex: 8000,
        position: {
            x: 'right',
            y: 'center'
        },
        outside: 'x',
        content: 'Scroll up and down or resize your browser, I will adjust my position!<br><br>Press [ESC] or click anywhere to close.',
        onInit: function() {
            this.options.height = (jQuery(window).height() - 200);
        },
        onOpen: function() {
            jQuery('#demoT8').addClass('active').html('Now scroll!');
        },
        onClose: function() {
            jQuery('#demoT8').removeClass('active').html('Click me!');
        }
    });
    new jBox('Modal', {
        attach: jQuery('#demoM1'),
        height: 200,
        title: 'I\'m a basic jBox modal window',
        content: '<div style="line-height: 30px;">Try to scroll ...it\'s blocked.<br>Press [ESC] or click anywhere to close.</div>'
    });
    new jBox('Modal', {
        attach: jQuery('#demoM2'),
        theme: 'ModalBorder',
        width: 350,
        height: 200,
        blockScroll: false,
        animation: 'zoomIn',
        draggable: 'title',
        closeButton: true,
        content: 'You can move this modal window',
        title: 'Click here to drag me around',
        overlay: false
    });
    new jBox('Modal', {
        attach: jQuery('#demoM3'),
        width: 450,
        height: 250,
        closeButton: 'title',
        animation: false,
        ajax: {
            url: '/Ajax/getContentM4',
            beforeSend: function() {
                this.setTitle('Content is loading…');
            },
            complete: function() {
                this.setTitle('Content loaded');
            },
            reload: true
        }
    });
    new jBox('Confirm', {
        content: 'Do you really want to click the submit button?'
    });
    jQuery('.demo-button-notice').click(function() {
        jQuery(this).addClass('active').children('.jBox-notice-text').html('Click me again!');
    }).mouseleave(function() {
        jQuery(this).removeClass('active').children('.jBox-notice-text').html('Click me!');
    });
    jQuery('#demoN1').click(function() {
        new jBox('Notice', {
            content: 'Hello, I\'m a notice!',
            position: {
                x: 15,
                y: 65
            },
            zIndex: 12000
        });
    });
    var colorsN2 = ['red', 'green', 'blue', 'yellow'];
    var currentColorN2 = 0;
    jQuery('#demoN2').click(function() {
        new jBox('Notice', {
            animation: 'flip',
            position: {
                x: 15,
                y: 65
            },
            content: 'Oooh! They also come in colors!',
            onInit: function() {
                this.options.color = colorsN2[currentColorN2];
                currentColorN2++; (currentColorN2 >= colorsN2.length) && (currentColorN2 = 0);
            },
            zIndex: 12000
        });
    });
    var colorsN3 = ['red', 'green', 'blue', 'yellow'];
    var titlesN3 = ['Oops', 'Well done', 'Reminder', 'Attention'];
    var contentsN3 = ['Sorry, something went wrong', 'You perfectly clicked a button', 'Don\'t forget to click the button one more time', 'Take care out there'];
    var currentColorN3 = 0;
    jQuery('#demoN3').click(function() {
        new jBox('Notice', {
            attributes: {
                x: 'left',
                y: 'bottom'
            },
            theme: 'NoticeBorder',
            color: 'black',
            audio: '/libraries/jBox/Source/audio/bling2',
            volume: noticeN3Volume,
            animation: {
                open: 'slide:bottom',
                close: 'slide:left'
            },
            onInit: function() {
                this.options.color = colorsN3[currentColorN3];
                this.options.title = titlesN3[currentColorN3];
                this.options.content = contentsN3[currentColorN3];
                currentColorN3++; (currentColorN3 >= colorsN3.length) && (currentColorN3 = 0);
            },
        });
    });
    var colorsN4 = ['black', 'red', 'green', 'blue', 'yellow'];
    var currentColorN4 = 0;
    jQuery('#demoN4').click(function() {
        new jBox('Notice', {
            autoClose: 10000,
            attributes: {
                x: 'right',
                y: 'bottom'
            },
            stack: false,
            animation: {
                open: 'tada',
                close: 'zoomIn'
            },
            title: 'Tadaaa! I\'m single!',
            content: 'Open another notice to close me!',
            onInit: function() {
                this.options.color = colorsN4[currentColorN4];
                currentColorN4++; (currentColorN4 >= colorsN4.length) && (currentColorN4 = 0);
            },
        });
    });
});