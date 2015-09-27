!function($) {

  "use strict"; // jshint ;_;

  var ImgClip = function(el, options) {
    var opts = ['aspectRatio', 'maxHeight', 'upload', 'target', 'csrftoken'];
    $.each(opts, function(_, opt){
      if (typeof $(el).data(opt) !== 'undefined') {
        options = typeof options == 'object' ? options : {}
        options[opt] = $(el).data(opt)
      }
    });

    this.$element   = $(el);
    this.$options   = $.extend(true , {}, $.fn.imgclip.defaults, options, this.$element.data('options'));
    this.$csrftoken = typeof $.cookie === 'function' ? $.cookie('csrftoken'):'x';
    this.$panel     = null;
    this.$dialog    = null;
    this.$canvas    = null;
    this.$_cv   = null;
    this.$layer     = null;
    this.$select    = null;
    this.$box       = null;
    this.$input     = null;
    this.$img       = null;
    this.$data      = null;
    this.$blob      = null;
    this.$pos       = {s: null, e: null};
    this.$W         = 0;
    this.$H         = 0;
    this.$ratio     = 1;
    this.$w2h       = null;
    this.$isSelected= false;
    this.$isSelecting= false;
    this.$isResizing= false;
    this.$acP       = null; // active point

    this.init();
  };

  ImgClip.prototype = {
    constructor: ImgClip

  , __reset: function() {
    this.$pos = {s: null, e: null};
    this.$isSelected = false;
    this.$isSelecting = false;
    this.$isResizing = false;
    this.$dialog.hide();
    this.$panel.show();
  }

  , init: function() {
      var _this = this
        , el = this.$element;

      if (this.$panel === null) {
        var aspR = this.$options.aspectRatio
          , re = /\d+:\d+/ig
          , panel = $('<div/>', {'class': 'imgclip-panel'})
          , layer = $('<div/>', {'class': 'imgclip-layer'}).hide()
          , select = $('<div/>', {'class': 'imgclip-select'}).hide()
          , dialog = $('<div/>', {'class': 'imgclip-dialog'}).hide()
          , d1 = $('<div/>', {'class': 'd t l'})
          , d2 = $('<div/>', {'class': 'd t r'})
          , d3 = $('<div/>', {'class': 'd b l'})
          , d4 = $('<div/>', {'class': 'd b r'})
          , d5 = $('<div/>', {'class': 'd t x'})
          , d6 = $('<div/>', {'class': 'd b x'})
          , d7 = $('<div/>', {'class': 'd l y'})
          , d8 = $('<div/>', {'class': 'd r y'})
          , d
          , canvas = $('<canvas/>', {'id': 'imgclip-canvas', 'class': 'imgclip-canvas'})
            .hide()
          , _cv = $('<canvas/>', {'id': '_cv', 'class': 'hidden'}).hide()
          , okBtn = $('<input />', {'class': 'imgclip-submit-btn btn btn-primary',
            'type': 'button', 'value': '上传'})
            .click(function() {_this.uploadImg();})
          , clBtn = $('<input />', {'class': 'imgclip-cancel-btn btn btn-default',
            'type': 'button', 'value': '重新选择'})
            .click(function() {_this.__reset();})
          , imgCliped = $('<img/>', {'class': 'imgclip-output'})
            .bind('dblclick', function() {_this.__reset();});

        if (re.test(aspR)) {
          this.$w2h = [parseInt(aspR.split(':')[0]), parseInt(aspR.split(':')[1])];
        }

        if (el.is('input')) {
          el.before(panel);
          select.append(d1).append(d2).append(d3).append(d4);
          select.append(d5).append(d6).append(d7).append(d8);
          panel.append(canvas).append(layer).append(select).append(el);
          dialog.append(imgCliped).append(okBtn).append(clBtn)
          panel.after(_cv).after(dialog).before($('<p/>', {'clear': 'both'}));
          el.addClass('btn btn-default');

          panel
          .mousemove(function() {
            if (_this.$isResizing || _this.$isSelected || _this.$isSelecting) {
              select.addClass('imgclip-move');
            } else {
              select.removeClass('imgclip-move');
            }
          });

          canvas
          .mousedown(function(e) { // 000 -> 100
            _this.$isSelecting = true;
            _this.$isSelected = false;
            _this.$isResizing = false;
            _this.$pos.s = _this.getPos(e);
            _this.$pos.e = null;
            _this.layOut();
            e.preventDefault();
            e.stopPropagation();
          });

          layer
          .mousedown(function(e) { // 000 -> 100 100/010/001 -> 000
            _this.$isSelecting = true;
            _this.$isSelected = false;
            _this.$isResizing = false;
            _this.$pos.s = _this.getPos(e);
            _this.$pos.e = null;
            _this.layOut();
          })
          .mousemove(function(e) {
            if (_this.$isResizing) {
              _this.resiZin(e);
            } else if (_this.$isSelecting) {
              _this.$pos.e = _this.getPos(e);
              _this.layOut();
            }
            else if (_this.$isSelected) {
              _this.moveSelect(e);
            }
          })
          .mouseup(function(e) {
            _this.$isResizing = false;
            _this.$isSelecting = false;
          });

          select
          .on('mousedown mouseup click', function(e) {
            e.preventDefault();
            e.stopPropagation();
          })
          .mousedown(function(e) { // click
            _this.$isSelected = _this.$isSelected ? false : true;
          })
          .mouseup(function(e) {
            _this.$isResizing = false;
            _this.$isSelecting = false;
          })
          .mousemove(function(e) {
            if (_this.$isResizing) {
              _this.resiZin(e);
            } else if (_this.$isSelecting) {
              _this.$pos.e = _this.getPos(e);
              _this.layOut();
            } else if (_this.$isSelected) {
              _this.moveSelect(e);
            }
          })
          .dblclick(function() {
            _this.$isSelecting = false;
            _this.$isSelected = false;
            _this.$isResizing = false;
            select.removeClass('imgclip-move');
            layer.hide();
            select.hide();
            panel.hide();
            dialog.show();
            _this.saveSelect();
          });

          $('.d')
          .on('mousedown mouseup click', function(e) {
            e.preventDefault();
            e.stopPropagation();
          })
          .mousemove(function(e){
            if (_this.$isResizing) {
              _this.resiZin(e);
              e.preventDefault();
              e.stopPropagation();
            }
          })
          .mousedown(function(e) {
            if (!_this.$isSelecting) {
              _this.$isResizing = _this.$isResizing ? false : true;
              if (_this.$isResizing) {
                _this.$acP = $(this);
              }

            } else {
              _this.$isSelecting = false;
            }
          })
          .mouseup(function(e) {
            _this.$isSelected = false;
            _this.$isSelecting = false;
            _this.$isResizing = false;
          });

          this.$panel   = panel;
          this.$dialog  = dialog;
          this.$input   = el;
          this.$canvas  = document.getElementById("imgclip-canvas");
          this.$_cv = document.getElementById("_cv");
          this.$layer   = layer;
          this.$select  = select;
          this.$input.change(function(e) {
            canvas.show();
            _this.$layer.hide();
            _this.$select.hide();
            _this.readImg(this)
          }).click(function() {
            $('.imgclip-output').remove();
            okBtn.before(imgCliped.bind('dblclick', function() {_this.__reset();}));
          });
        }
      } else {
        this.$panel.show();
      }

      return this;
  }

  , showImgClip: function() {
    var _this = this
      , canvas = this.$canvas
      , ctx
      , maxHeight = _this.$options.maxHeight
      , data = this.$data;
    _this.$dialog.hide();
    this.$img = new Image();
    this.$img.onload = function() {
      if(this.height > maxHeight) {
        _this.$ratio = maxHeight / this.height;
        this.width *= maxHeight / this.height;
        this.height = maxHeight;
      }

      _this.$W = this.width;
      _this.$H = this.height;
      ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height); // canvas清屏
      canvas.width = this.width;
      canvas.height = this.height;
      ctx.drawImage(this, 0, 0, this.width, this.height); // 将图像绘制到canvas上
    }

    this.$img.src = data;
  }

  , layOut: function() {
    var _this = this
      , box = this.$box
      , p = this.$pos
      , layer = this.$layer
      , select = this.$select;

    this.$layer.width(box.width).height(box.height).show();

    if (p.s === null || p.e === null) return;
    var w = Math.abs(parseInt(p.e.x - p.s.x))
      , h = Math.abs(parseInt(p.e.y - p.s.y))
      , x = Math.min(p.e.y, p.s.y)
      , y = Math.min(p.e.x, p.s.x)
    this.$select.width(w).height(h).css({
      'top': x+'px',
      'left': y+'px',
      'background-image': 'url('+_this.$canvas.toDataURL("image/png")+')',
      'background-position': (-1*y) + 'px' + ' ' + (-1*x) + 'px'
    }).show();
  }

  , moveSelect: function(e) {
    var _this = this
      , pos = this.$pos
      , p = this.getPos(e)
      , w = Math.abs(parseInt((pos.s.x - pos.e.x) / 2))
      , h = Math.abs(parseInt((pos.s.y - pos.e.y) / 2))
      , sx, sy, ex, ey;

    sx = p.x - w;
    sy = p.y - h;
    ex = p.x + w;
    ey = p.y + h;
    if (!(sx >= 0 && sx <= this.$W && sy >= 0 && sy <= this.$H) ||
        !(ex >= 0 && ex <= this.$W && ey >= 0 && ey <= this.$H))
    { return; }

    this.$pos.s.x = sx;
    this.$pos.s.y = sy;
    this.$pos.e.x = ex;
    this.$pos.e.y = ey;
    this.$select.css({
      'top': sy+'px',
      'left': sx+'px',
      'background-position': (-1*sx) + 'px' + ' ' + (-1*sy) + 'px'
    })
  }

  , resiZin: function(e) {
    var _this = this
      , d = this.$acP
      , w2h = this.$w2h
      , p = _this.getPos(e);

    if (d.is('.t') && d.is('.l')) {
      _this.$pos.s = p;
    } else if (d.is('.t') && d.is('.r')) {
      _this.$pos.s.y = p.y;
      _this.$pos.e.x = p.x;
    } else if (d.is('.b') && d.is('.l')) {
      _this.$pos.s.x = p.x;
      _this.$pos.e.y = p.y;
    } else if (d.is('.b') && d.is('.r')) {
      _this.$pos.e = p;
    } else if (d.is('.t') && d.is('.x')) {
      _this.$pos.s.y = p.y;
    } else if (d.is('.b') && d.is('.x')) {
      _this.$pos.e.y = p.y;
    } else if (d.is('.l') && d.is('.y')) {
      _this.$pos.s.x = p.x;
    } else if (d.is('.r') && d.is('.y')) {
      _this.$pos.e.x = p.x;
    }
    var pp = _this.$pos
    if (pp.s && pp.e)
      console.log(pp.e.x-pp.s.x, pp.e.y-pp.s.y);
    _this.layOut();
  }

  , saveSelect: function() {
    var _this = this
      , img = this.$img
      , cv = this.$_cv
      , ctx
      , pos = this.$pos
      , sx = Math.min(pos.e.x, pos.s.x)
      , sy = Math.min(pos.e.y, pos.s.y)
      , sw = Math.abs(parseInt(pos.e.x - pos.s.x))
      , sh = Math.abs(parseInt(pos.e.y - pos.s.y));
    if (pos.e === null && pos.s !== null) return true;

    ctx = cv.getContext("2d");
    ctx.clearRect(0, 0, cv.width, cv.height); // canvas清屏
    cv.width = sw;
    cv.height = sh;
    ctx.drawImage(img
      , parseInt(sx / _this.$ratio)
      , parseInt(sy / _this.$ratio)
      , parseInt(sw / _this.$ratio)
      , parseInt(sh / _this.$ratio)
      , 0, 0, sw, sh
    );

    var imgOut = $(".imgclip-output")
      , imgData = cv.toDataURL("image/jpg");
    imgOut.attr({'src': imgData});
    _this.$blob = window.dataURLtoBlob && window.dataURLtoBlob(imgData);
  }

  , uploadImg: function() {
    if (this.$options.upload.url === null || !this.$options.upload.url) {
      console.log('You must config the upload.url section');
      return;
    }
    var _this = this
      , url = this.$options.upload.url
      , name = this.$options.upload.name
      , extra = this.$options.upload.extraData
      , target = $(this.$options.target)
      , csrftoken = this.$csrftoken
      , form = new FormData()
      , xhr = new XMLHttpRequest();

    form.append(name, this.$blob);
    for (var k in extra) {
      form.append(k, extra[k]);
    }
    xhr.upload.onerror = function() {
      console.log('Error');
    };
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status === 200) {
        var resp = $.parseJSON(xhr.responseText);
        if (resp && !!resp['url'] && resp['url']) {
          // target.val(resp.url);
          target.val(resp.pk);
          $('input.btn', _this.$dialog).hide();
          $('img', _this.$dialog).unbind();
          // console.log(resp);
        }
      }
    };

    xhr.open('POST', url, true);
    if (!this.crossDomain)
      xhr.setRequestHeader("X-CSRFToken", csrftoken);
    xhr.setRequestHeader("Cache-Control", "no-cache");
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    xhr.send(form);
  }

  , readImg: function(input) {
    var _this = this, reader = new FileReader();

    if (!input.files || !input.files[0]) {
      return;
    }

    reader.onload = function(e) {
      _this.$data = e.target.result;
      _this.showImgClip();
    }
    reader.readAsDataURL(input.files[0]);
  }

  , getPos: function(e, dir) {
    var cv = this.$canvas
      , b = cv.getBoundingClientRect();
    this.$box = b;
    return {
      x: parseInt(e.clientX - b.left * (cv.width / b.width))
    , y: parseInt(e.clientY - b.top * (cv.height / b.height))
    };
  }};

  $.fn.imgclip = function(option) {
    return this.each(function() {
      var $this = $(this)
        , data = $this.data('imgclip')
        , options = typeof option == 'object' && option;
      if (!data) $this.data('imgclip', (data = new ImgClip(this, options)))
    })
  };

  $.fn.imgclip.messages = {};

  $.fn.imgclip.defaults = {
    aspectRatio: null,//'5:1',
    maxHeight: 500,
    target: 'input.imgclip-target',
    upload: {
      url: null,
      name: 'img',
      extraData: {
        //'username': 'zhangsan'
      }
    },
    csrftoken: 'default-csrftoken'
  };

  $.fn.imgclip.Constructor = ImgClip;

  var initImgClip = function(el) {
    var $this = el;

    if ($this.data('imgclip')) {
      $this.data('imgclip').init();
      return;
    }

    $this.imgclip()
  };

  $(document)
  .ready(function(){
    $('input[data-provide="imgclip"]').each(function(){
      initImgClip($(this));
    })
  });
}(window.jQuery);