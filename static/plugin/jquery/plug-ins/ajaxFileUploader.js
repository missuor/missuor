!function ($) {

  "use strict"; // jshint ;_;

  var Uploader = function (el, options) {
    var opts = ['file', 'target'];
    $.each(opts, function(_, opt){
      if (typeof $(el).data(opt) !== 'undefined') {
        options = typeof options == 'object' ? options : {}
        options[opt] = $(el).data(opt)
      }
    });

    // Class Properties
    this.$ns        = 'up';
    this.$element   = $(el);
    this.$options   = $.extend(true , {}, $.fn.uploader.defaults, options, this.$element.data('options'));
    this.$csrftoken = typeof $.cookie === 'function' ? $.cookie('csrftoken'):'x';
    this.$panel     = null;
    this.$board     = null;
    this.$input     = null;
    this.$upload    = null;
    this.$loading   = null;
    this.$preview   = null;

    this.showUploader();
  };

  Uploader.prototype = {

    constructor: Uploader,

    showUploader: function () {
      var _this = this, el = this.$element;

      if (this.$panel === null) {
        var panel = $('<div/>', {'class': 'up-panel'})
          , board = $('<div/>', {'class': 'up-board'})
          , preview = $('<div/>', {'class': 'up-preview'})
          , input;
        
        board.html('board');
        
        if (el.is('input')) {
          el.before(panel);
          input = el;
          panel.append(input).append(board);
          
          
          preview = $('<div/>', {'class': 'up-preview hidden'});
          upload = $('<div/>', {'class': 'up-upload text-center'});
          loading = $('<div/>', {'class': 'up-loading text-center hidden'});
          p = $('<p/>').html('点击或将图片拖拽至此上传！');
          i = $('<i/>', {'class': 'loading icon'});


          this.$panel = panel;
          this.$input = input;
          this.$board = board;
          this.$input.change(function () {
            _this.ajaxFileUpload();
          });

        }
      } else {
        this.$panel.show();
      }

      return this;
    },

    ajaxFileUpload: function () {
      var _this = this,
          inputFile = this.$input,
          upload = this.$upload,
          loading = this.$loading,
          url = this.$options.file.url,
          name = this.$options.file.name,
          target = $(this.$options.target),
          csrftoken = this.$csrftoken,
          file, size, fileName, resp, xhr,
          suffixReg = /^.*\.(?:jpg|png|gif)$/,
          form = new FormData();

      if (null === url || '' === url || !url) {
        console.log('uploadUrlError');
        return;
      }

      if (inputFile.length > 0 &&
          inputFile[0].files &&
          inputFile[0].files.length > 0)
      {
        file = inputFile[0].files[0];
        size = file.size;
        form.append(name, file);
        fileName = file.name.toLowerCase();

        if (!fileName.match(suffixReg)) {
          console.log('Type');
          return;
        }

        var k, data = _this.$options.file.extradata;
        for (k in data) {
          form.append(k, data[k]);
        }
        xhr = new XMLHttpRequest();
        xhr.upload.onprogress = function (evt) {
          console.log(Math.round(evt.loaded * 100 / evt.total));
        };

        xhr.upload.onload = function () {
          setTimeout(function () {
            console.log('Success');
          }, 1000);
        };

        xhr.upload.onerror = function () {
          console.log('Error');
        };

        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4 && xhr.status === 200) {
            resp = $.parseJSON(xhr.responseText);
            if (resp && !!resp['url'] && resp['url']) {
              console.log(target);
              target.val(resp.url);
              _this.$preview.html($('<img/>', {
                'class': 'preview-img',
                src: resp.url
              })).removeClass('hidden');

              _this.$loading.addClass('hidden');
              _this.$input.removeClass('hidden');
              console.log('afdasf');


            } else {
              
            }
          }
        };

        xhr.open('POST', url, true);
        if (!this.crossDomain) xhr.setRequestHeader("X-CSRFToken", csrftoken);
        xhr.setRequestHeader("Cache-Control", "no-cache");
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        xhr.send(form);
      }


    }
  };

  $.fn.uploader = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('uploader')
        , options = typeof option == 'object' && option;
      if (!data)
        $this.data('uploader', (data = new Uploader(this, options)))
    })
  };

  $.fn.uploader.messages = {};

  $.fn.uploader.defaults = {
    width: 'inherit',
    height: 'inherit',
    file: {
      url: '/ajaxupload/',
      name: 'file'
    },
    target: '#uploader-target'
  };

  $.fn.uploader.Constructor = Uploader;

  var initUploader = function(el) {
    var $this = el;

    if ($this.data('uploader')) {
      $this.data('uploader').showUploader();
      return;
    }

    $this.uploader()
  };

  $(document)
  .ready(function(){
   $('input[data-provide="uploader"]').each(function(){
    initUploader($(this));
   })
  });
}(window.jQuery);