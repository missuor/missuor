/* ===================================================
 * bootstrap-markdown.js v2.9.0
 * http://github.com/toopay/bootstrap-markdown
 * ===================================================
 * Copyright 2013-2015 Taufan Aditya
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */


!function ($) {

  "use strict"; // jshint ;_;

  /* MARKDOWN CLASS DEFINITION
   * ========================== */

  var Markdown = function (element, options) {
    // @TODO : remove this BC on next major release
    // @see : https://github.com/toopay/bootstrap-markdown/issues/109
    var opts = ['autofocus', 'savable', 'hideable', 'width',
      'height', 'resize', 'iconlibrary', 'language',
      'footer', 'fullscreen', 'hiddenButtons', 'disabledButtons',

      // 新增的配置项:
      'img',
      'code',
      'cache',
      'form'

    ];
    $.each(opts,function(_, opt){
      if (typeof $(element).data(opt) !== 'undefined') {
        options = typeof options == 'object' ? options : {}
        options[opt] = $(element).data(opt)
      }
    });
    // End BC

    // Class Properties
    this.$ns           = 'bootstrap-markdown';
    this.$element      = $(element);
    this.$editable     = {el:null, type:null,attrKeys:[], attrValues:[], content:null};
    this.$options      = $.extend(true, {}, $.fn.markdown.defaults, options, this.$element.data('options'));
    this.$oldContent   = null;
    this.$isPreview    = false;
    this.$isFullscreen = false;
    this.$editor       = null;
    this.$textarea     = null;
    this.$handler      = [];
    this.$callback     = [];
    this.$nextTab      = [];

    /* CSRFTOKEN */
    this.$csrftoken = typeof $.cookie === 'function' ? $.cookie('csrftoken'):'undefined';

    /* 图片上传的部分 */
    this.$imgUploadMode = false;
    this.$imgUploadpanel = null;
    this.$imgInputfile = null;
    this.$imgStatebar = null;
    this.$imgProgress = null;
    this.$imgPercent = null;
    this.$imgFilesize = 524288;

    /* 代码上传的部分 */
    this.$codeUploadMode = false;
    this.$codeUploadpanel = null;
    this.$codeTextarea = null;
    this.$codeStateBar = null;
    this.$codeChoiceBar = null;

    /* 本地化存储部分 */
    this.$localCacheKeys = [];
    this.$form = null;

    /* 全屏编辑部分 */
    this.$fullPreview = null;
    this.$innerPreview = null;


    this.showEditor();
    this.localCacheGet();
    this.localCacheSet();
  };

  Markdown.prototype = {

    constructor: Markdown

  , __alterButtons: function(name,alter) {
      var handler = this.$handler, isAll = (name == 'all'),that = this;

      $.each(handler,function(k,v) {
        var halt = true;
        if (isAll) {
          halt = false;
        } else {
          halt = v.indexOf(name) < 0;
        }

        if (halt === false) {
          alter(that.$editor.find('button[data-handler="'+v+'"]'));
        }
      });
    }

  , __buildButtons: function(buttonsArray, container) {
      var i,
          ns = this.$ns,
          handler = this.$handler,
          callback = this.$callback;

      for (i=0;i<buttonsArray.length;i++) {
        // Build each group container
        var y, btnGroups = buttonsArray[i];
        for (y=0;y<btnGroups.length;y++) {
          // Build each button group
          var z,
              buttons = btnGroups[y].data,
              btnGroupContainer = $('<div/>', {
                                    'class': 'btn-group'
                                  });

          for (z=0;z<buttons.length;z++) {
            var button = buttons[z],
                buttonContainer, buttonIconContainer,
                buttonHandler = ns+'-'+button.name,
                buttonIcon = this.__getIcon(button.icon),
                btnText = button.btnText ? button.btnText : '',
                btnClass = button.btnClass ? button.btnClass : 'btn',
                tabIndex = button.tabIndex ? button.tabIndex : '-1',
                hotkey = typeof button.hotkey !== 'undefined' ? button.hotkey : '',
                hotkeyCaption = typeof jQuery.hotkeys !== 'undefined' && hotkey !== '' ? ' ('+hotkey+')' : '';

            // Construct the button object
            buttonContainer = $('<button></button>');
            buttonContainer.text(' ' + this.__localize(btnText)).addClass('btn-default btn-sm').addClass(btnClass);
            if(btnClass.match(/btn\-(primary|success|info|warning|danger|link)/)){
                buttonContainer.removeClass('btn-default');
            }
            buttonContainer.attr({
                'type': 'button',
                'title': this.__localize(button.title) + hotkeyCaption,
                'tabindex': tabIndex,
                'data-provider': ns,
                'data-handler': buttonHandler,
                'data-hotkey': hotkey
            });
            if (button.toggle === true){
              buttonContainer.attr('data-toggle', 'button');
            }
            buttonIconContainer = $('<span/>');
            buttonIconContainer.addClass(buttonIcon);
            buttonIconContainer.prependTo(buttonContainer);

            // Attach the button object
            btnGroupContainer.append(buttonContainer);

            // Register handler and callback
            handler.push(buttonHandler);
            callback.push(button.callback);
          }

          // Attach the button group into container dom
          container.append(btnGroupContainer);
        }
      }

      return container;
    }
  , __setListener: function() {
      // Set size and resizable Properties
      var hasRows = typeof this.$textarea.attr('rows') !== 'undefined',
          maxRows = this.$textarea.val().split("\n").length > 5 ? this.$textarea.val().split("\n").length : '5',
          rowsVal = hasRows ? this.$textarea.attr('rows') : maxRows;

      this.$textarea.attr('rows',rowsVal);
      if (this.$options.resize) {
        this.$textarea.css('resize',this.$options.resize);
      }

      this.$textarea
        .on('focus',    $.proxy(this.focus, this))
        .on('keypress', $.proxy(this.keypress, this))
        .on('keyup',    $.proxy(this.keyup, this))
        .on('change',   $.proxy(this.change, this))
        .on('select',   $.proxy(this.select, this));

      if (this.eventSupported('keydown')) {
        this.$textarea.on('keydown', $.proxy(this.keydown, this));
      }

      // Re-attach markdown data
      this.$textarea.data('markdown',this);
    }

  , __handle: function(e) {
      var target = $(e.currentTarget),
          handler = this.$handler,
          callback = this.$callback,
          handlerName = target.attr('data-handler'),
          callbackIndex = handler.indexOf(handlerName),
          callbackHandler = callback[callbackIndex];

      // Trigger the focusin
      $(e.currentTarget).focus();

      callbackHandler(this);

      // Trigger onChange for each button handle
      this.change(this);

      // Unless it was the save handler,
      // focusin the textarea
      if (handlerName.indexOf('cmdSave') < 0) {
        this.$textarea.focus();
      }

      e.preventDefault();
    }

  , __localize: function(string) {
      var messages = $.fn.markdown.messages,
          language = this.$options.language;
      if (
        typeof messages !== 'undefined' &&
        typeof messages[language] !== 'undefined' &&
        typeof messages[language][string] !== 'undefined'
      ) {
        return messages[language][string];
      }
      return string;
    }

  , __getIcon: function(src) {
    return typeof src == 'object' ? src[this.$options.iconlibrary] : src;
  }

  , setFullscreen: function(mode) {
    var $editor = this.$editor,
        $textarea = this.$textarea,
        $innerPreview = this.$innerPreview,
        //小预览窗口
        preview = $('div[data-provider="markdown-preview"]'),
        //预览按钮
        previewButton = $('button[data-handler="bootstrap-markdown-cmdPreview"]');

    if (mode === true) {
      if (this.$isPreview)
        this.hidePreview();

      $editor.addClass('md-fullscreen-mode');
      $('body').addClass('md-nooverflow');
      this.$options.onFullscreen(this);

      $innerPreview.html(marked($textarea.val()));
      $textarea.keyup(function (evt) {
        $innerPreview.html(marked($textarea.val()));
      });

      if (!this.isIE8) {
        if (this.$options.flowChart) {
          $innerPreview.find(".flowchart").flowChart();
        }
      }

      $textarea.scroll(function () {
        var __this = $(this).get(0),H, h,
          scrollHeight = __this.scrollHeight,
          scrollTop = __this.scrollTop,
          __inner = $innerPreview.get(0),
          innerHeight = __inner.scrollHeight,
          top = scrollTop * innerHeight / scrollHeight;
        $innerPreview.scrollTop(top);
      });

      if (preview)
          preview.remove();

      if (previewButton)
          previewButton.hide();

    } else {
      $editor.removeClass('md-fullscreen-mode');
      $('body').removeClass('md-nooverflow');

      if (previewButton)
        previewButton.show();

      if (this.$isPreview)
        this.showPreview();

      if (this.$isPreview == true) this.hidePreview().showPreview()
    }

    this.$isFullscreen = mode;
    $textarea.focus();
  }

  , showEditor: function() {
      var instance = this,
          textarea,
          ns = this.$ns,
          container = this.$element,
          originalHeigth = container.css('height'),
          originalWidth = container.css('width'),
          editable = this.$editable,
          handler = this.$handler,
          callback = this.$callback,
          options = this.$options,
          fullPreview = this.$fullPreview,
          innerPreview = this.$fullPreview,
          editor = $( '<div/>', {
                      'class': 'md-editor',
                      click: function() {
                        instance.focus();
                      }
                    });

      // Prepare the editor
      if (this.$editor === null) {
        // Create the panel
        var editorHeader = $('<div/>', {
                            'class': 'md-header btn-toolbar'
                            });

        // Merge the main & additional button groups together
        var allBtnGroups = [];
        if (options.buttons.length > 0) allBtnGroups = allBtnGroups.concat(options.buttons[0]);
        if (options.additionalButtons.length > 0) {
          // iterate the additional button groups
          $.each(options.additionalButtons[0], function(idx, buttonGroup){

            // see if the group name of the addional group matches an existing group
            var matchingGroups = $.grep(allBtnGroups, function(allButtonGroup, allIdx){
              return allButtonGroup.name === buttonGroup.name;
            });

            // if it matches add the addional buttons to that group, if not just add it to the all buttons group
            if(matchingGroups.length > 0) {
              matchingGroups[0].data = matchingGroups[0].data.concat(buttonGroup.data);
            } else {
              allBtnGroups.push(options.additionalButtons[0][idx]);
            }

          });
        }

        // Reduce and/or reorder the button groups
        if (options.reorderButtonGroups.length > 0) {
          allBtnGroups = allBtnGroups
              .filter(function(btnGroup) {
                return options.reorderButtonGroups.indexOf(btnGroup.name) > -1;
              })
              .sort(function(a, b) {
                if (options.reorderButtonGroups.indexOf(a.name) < options.reorderButtonGroups.indexOf(b.name)) return -1;
                if (options.reorderButtonGroups.indexOf(a.name) > options.reorderButtonGroups.indexOf(b.name)) return 1;
                return 0;
              });
        }

        // Build the buttons
        if (allBtnGroups.length > 0) {
          editorHeader = this.__buildButtons([allBtnGroups], editorHeader);
        }

        if (options.fullscreen.enable) {
          editorHeader.append('<div class="md-controls"><a class="md-control md-control-fullscreen" href="#"><span class="'+this.__getIcon(options.fullscreen.icons.fullscreenOn)+'"></span></a></div>').on('click', '.md-control-fullscreen', function(e) {
              e.preventDefault();
              instance.setFullscreen(true);
          });
        }

        editor.append(editorHeader);

        // Wrap the textarea
        if (container.is('textarea')) {
          container.before(editor);
          textarea = container;
          textarea.addClass('md-input');
          editor.append(textarea);
        } else {
          var rawContent = (typeof toMarkdown == 'function') ? toMarkdown(container.html()) : container.html(),
              currentContent = $.trim(rawContent);

          // This is some arbitrary content that could be edited
          textarea = $('<textarea/>', {
                       'class': 'md-input',
                       'val' : currentContent
                      });

          editor.append(textarea);

          // Save the editable
          editable.el = container;
          editable.type = container.prop('tagName').toLowerCase();
          editable.content = container.html();

          $(container[0].attributes).each(function(){
            editable.attrKeys.push(this.nodeName);
            editable.attrValues.push(this.nodeValue);
          });

          // Set editor to blocked the original container
          container.replaceWith(editor);
        }

        if (options.fullscreen.enable && fullPreview === null) {
            fullPreview = $('<div/>', {
                'class': 'md-full-preview'
            });
            var previewBody = $('<div/>', {
                'class': 'md-full-preview-body'
            });

            innerPreview = $('<div/>', {
                'class': 'md-full-preview-inner'
            });
            previewBody.append(innerPreview);
            fullPreview.append(previewBody);
            var leftTool = $('<div/>', {
                'class': 'md-full-preview-tool'
            });
            fullPreview.append(leftTool);
            editor.append(fullPreview);

            this.$innerPreview = innerPreview;
            this.$fullPreview = fullPreview;
        }



        var editorFooter = $('<div/>', {
                           'class': 'md-footer'
                         }),
            createFooter = false,
            footer = '';
        // Create the footer if savable
        if (options.savable) {
          createFooter = true;
          var saveHandler = 'cmdSave';

          // Register handler and callback
          handler.push(saveHandler);
          callback.push(options.onSave);

          editorFooter.append('<button class="btn btn-success" data-provider="'
                              + ns
                              + '" data-handler="'
                              + saveHandler
                              + '"><i class="icon icon-white icon-ok"></i> '
                              + this.__localize('Save')
                              + '</button>');


        }

        footer = typeof options.footer === 'function' ? options.footer(this) : options.footer;

        if ($.trim(footer) !== '') {
          createFooter = true;
          editorFooter.append(footer);
        }

        if (createFooter) editor.append(editorFooter);

        // Set width
        if (options.width && options.width !== 'inherit') {
          if (jQuery.isNumeric(options.width)) {
            editor.css('display', 'table');
            textarea.css('width', options.width + 'px');
          } else {
            editor.addClass(options.width);
          }
        }

        // Set height
        if (options.height && options.height !== 'inherit') {
          if (jQuery.isNumeric(options.height)) {
            var height = options.height;
            if (editorHeader) height = Math.max(0, height - editorHeader.outerHeight());
            if (editorFooter) height = Math.max(0, height - editorFooter.outerHeight());
            textarea.css('height', height + 'px');
          } else {
            editor.addClass(options.height);
          }
        }

        // Reference
        this.$editor     = editor;
        this.$textarea   = textarea;
        this.$editable   = editable;
        this.$oldContent = this.getContent();

        var form = this.$editor.parent(), i=0;
        while (!form.is('form') && !form.is('body') && i < 20) {
          form = form.parent();
          i++;
        }
        if (form.is('form')) this.$form = form;
        if (this.$form) this.__setForm();

        this.__setListener();

        // Set editor attributes, data short-hand API and listener
        this.$editor.attr('id',(new Date()).getTime());
        this.$editor.on('click', '[data-provider="bootstrap-markdown"]', $.proxy(this.__handle, this));

        if (this.$element.is(':disabled') || this.$element.is('[readonly]')) {
          this.$editor.addClass('md-editor-disabled');
          this.disableButtons('all');
        }

        if (this.eventSupported('keydown') && typeof jQuery.hotkeys === 'object') {
          editorHeader.find('[data-provider="bootstrap-markdown"]').each(function() {
            var $button = $(this),
                hotkey = $button.attr('data-hotkey');
            if (hotkey.toLowerCase() !== '') {
              textarea.bind('keydown', hotkey, function() {
                $button.trigger('click');
                return false;
              });
            }
          });
        }

        if (options.initialstate === 'preview') {
          this.showPreview();
        } else if (options.initialstate === 'fullscreen' && options.fullscreen.enable) {
          this.setFullscreen(true);
        }

      } else {
        this.$editor.show();
      }

      if (options.autofocus) {
        this.$textarea.focus();
        this.$editor.addClass('active');
      }

      if (options.fullscreen.enable && options.fullscreen !== false) {
        this.$editor.append('<div class="md-fullscreen-controls">'
                        + '<a href="#" class="exit-fullscreen" title="Exit fullscreen"><span class="' + this.__getIcon(options.fullscreen.icons.fullscreenOff) + '">'
                        + '</span></a>'
                        + '</div>');
        this.$editor.on('click', '.exit-fullscreen', function(e) {
          e.preventDefault();
          instance.setFullscreen(false);
        });
      }

      // hide hidden buttons from options
      this.hideButtons(options.hiddenButtons);

      // disable disabled buttons from options
      this.disableButtons(options.disabledButtons);

      // Trigger the onShow hook
      options.onShow(this);

      // Cache
      //this.localCacheGet();
      //this.localCacheSet();

      return this;
    }

  , parseContent: function(val) {
      var content, _this = this;

      // parse with supported markdown parser
      var val = val || this.$textarea.val();

      if (this.$options.parser) {
        content = this.$options.parser(val);
      } else if (typeof markdown == 'object') {
        content = markdown.toHTML(val);
      } else if (typeof marked == 'function') {
        content = marked(val);
      } else {
        content = val;
      }

      return content;
    }

  , showPreview: function() {
      var options = this.$options,
          container = this.$textarea,
          afterContainer = container.next(),
          replacementContainer = $('<div/>',{'class':'md-preview','data-provider':'markdown-preview'}),
          content,
          callbackContent;

      if (this.$isPreview == true) {
        // Avoid sequenced element creation on missused scenario
        // @see https://github.com/toopay/bootstrap-markdown/issues/170
        return this;
      }

      // Give flag that tell the editor enter preview mode
      this.$isPreview = true;
      // Disable all buttons
      this.disableButtons('all').enableButtons('cmdPreview');

      // Try to get the content from callback
      callbackContent = options.onPreview(this);
      // Set the content based from the callback content if string otherwise parse value from textarea
      content = typeof callbackContent == 'string' ? callbackContent : this.parseContent();

      // Build preview element
      replacementContainer.html(content);

      if (afterContainer && afterContainer.attr('class') == 'md-footer') {
        // If there is footer element, insert the preview container before it
        replacementContainer.insertBefore(afterContainer);
      } else {
        // Otherwise, just append it after textarea
        container.parent().append(replacementContainer);
      }

      // Set the preview element dimensions
      replacementContainer.css({
        width: container.outerWidth() + 'px',
        height: container.outerHeight() + 'px'
      });

      if (this.$options.resize) {
        replacementContainer.css('resize',this.$options.resize);
      }

      // Hide the last-active textarea
      container.hide();

      // Attach the editor instances
      replacementContainer.data('markdown',this);

      if (this.$element.is(':disabled') || this.$element.is('[readonly]')) {
        this.$editor.addClass('md-editor-disabled');
        this.disableButtons('all');
      }

      return this;
    }

  , hidePreview: function() {
      // Give flag that tell the editor quit preview mode
      this.$isPreview = false;

      // Obtain the preview container
      var container = this.$editor.find('div[data-provider="markdown-preview"]');

      // Remove the preview container
      container.remove();

      // Enable all buttons
      this.enableButtons('all');
      // Disable configured disabled buttons
      this.disableButtons(this.$options.disabledButtons);

      // Back to the editor
      this.$textarea.show();
      this.__setListener();

      return this;
    }

  , isDirty: function() {
      return this.$oldContent != this.getContent();
    }

  , getContent: function() {
      return this.$textarea.val();
    }

  , setContent: function(content) {
      this.$textarea.val(content);

      return this;
    }

  , findSelection: function(chunk) {
    var content = this.getContent(), startChunkPosition;

    if (startChunkPosition = content.indexOf(chunk), startChunkPosition >= 0 && chunk.length > 0) {
      var oldSelection = this.getSelection(), selection;

      this.setSelection(startChunkPosition,startChunkPosition+chunk.length);
      selection = this.getSelection();

      this.setSelection(oldSelection.start,oldSelection.end);

      return selection;
    } else {
      return null;
    }
  }

  , getSelection: function() {

      var e = this.$textarea[0];

      return (

          ('selectionStart' in e && function() {
              var l = e.selectionEnd - e.selectionStart;
              return { start: e.selectionStart, end: e.selectionEnd, length: l, text: e.value.substr(e.selectionStart, l) };
          }) ||

          /* browser not supported */
          function() {
            return null;
          }

      )();

    }

  , setSelection: function(start,end) {

      var e = this.$textarea[0];

      return (

          ('selectionStart' in e && function() {
              e.selectionStart = start;
              e.selectionEnd = end;
              return;
          }) ||

          /* browser not supported */
          function() {
            return null;
          }

      )();

    }

  , replaceSelection: function(text) {

      var e = this.$textarea[0];

      return (

          ('selectionStart' in e && function() {
              e.value = e.value.substr(0, e.selectionStart) + text + e.value.substr(e.selectionEnd, e.value.length);
              // Set cursor to the last replacement end
              e.selectionStart = e.value.length;
              return this;
          }) ||

          /* browser not supported */
          function() {
              e.value += text;
              return jQuery(e);
          }

      )();
    }

  , getNextTab: function() {
      // Shift the nextTab
      if (this.$nextTab.length === 0) {
        return null;
      } else {
        var nextTab, tab = this.$nextTab.shift();

        if (typeof tab == 'function') {
          nextTab = tab();
        } else if (typeof tab == 'object' && tab.length > 0) {
          nextTab = tab;
        }

        return nextTab;
      }
    }

  , setNextTab: function(start,end) {
      // Push new selection into nextTab collections
      if (typeof start == 'string') {
        var that = this;
        this.$nextTab.push(function(){
          return that.findSelection(start);
        });
      } else if (typeof start == 'number' && typeof end == 'number') {
        var oldSelection = this.getSelection();

        this.setSelection(start,end);
        this.$nextTab.push(this.getSelection());

        this.setSelection(oldSelection.start,oldSelection.end);
      }

      return;
    }

  , __parseButtonNameParam: function (names) {
      return typeof names == 'string' ?
                      names.split(' ') :
                      names;

    }

  , enableButtons: function(name) {
      var buttons = this.__parseButtonNameParam(name),
        that = this;

      $.each(buttons, function(i, v) {
        that.__alterButtons(buttons[i], function (el) {
          el.removeAttr('disabled');
        });
      });

      return this;
    }

  , disableButtons: function(name) {
      var buttons = this.__parseButtonNameParam(name),
        that = this;

      $.each(buttons, function(i, v) {
        that.__alterButtons(buttons[i], function (el) {
          el.attr('disabled','disabled');
        });
      });

      return this;
    }

  , hideButtons: function(name) {
      var buttons = this.__parseButtonNameParam(name),
        that = this;

      $.each(buttons, function(i, v) {
        that.__alterButtons(buttons[i], function (el) {
          el.addClass('hidden');
        });
      });

      return this;
    }

  , showButtons: function(name) {
      var buttons = this.__parseButtonNameParam(name),
        that = this;

      $.each(buttons, function(i, v) {
        that.__alterButtons(buttons[i], function (el) {
          el.removeClass('hidden');
        });
      });

      return this;
    }

  , eventSupported: function(eventName) {
      var isSupported = eventName in this.$element;
      if (!isSupported) {
        this.$element.setAttribute(eventName, 'return;');
        isSupported = typeof this.$element[eventName] === 'function';
      }
      return isSupported;
    }

  , keyup: function (e) {
      var blocked = false;
      switch(e.keyCode) {
        case 40: // down arrow
        case 38: // up arrow
        case 16: // shift
        case 17: // ctrl
        case 18: // alt
          break;

        case 9: // tab
          var nextTab;
          if (nextTab = this.getNextTab(),nextTab !== null) {
            // Get the nextTab if exists
            var that = this;
            setTimeout(function(){
              that.setSelection(nextTab.start,nextTab.end);
            },500);

            blocked = true;
          } else {
            // The next tab memory contains nothing...
            // check the cursor position to determine tab action
            var cursor = this.getSelection();

            if (cursor.start == cursor.end && cursor.end == this.getContent().length) {
              // The cursor already reach the end of the content
              blocked = false;
            } else {
              // Put the cursor to the end
              this.setSelection(this.getContent().length,this.getContent().length);

              blocked = true;
            }
          }

          break;

        case 13: // enter
          blocked = false;
          break;
        case 27: // escape
          if (this.$isFullscreen) this.setFullscreen(false);
          blocked = false;
          break;

        default:
          blocked = false;
      }

      if (blocked) {
        e.stopPropagation();
        e.preventDefault();
      }

      this.$options.onChange(this);
    }

  , change: function(e) {
      this.$options.onChange(this);
      return this;
    }
  , select: function (e) {
      this.$options.onSelect(this);
      return this;
    }
  , focus: function (e) {
      var options = this.$options,
          isHideable = options.hideable,
          editor = this.$editor;

      editor.addClass('active');

      // Blur other markdown(s)
      $(document).find('.md-editor').each(function(){
        if ($(this).attr('id') !== editor.attr('id')) {
          var attachedMarkdown;

          if (attachedMarkdown = $(this).find('textarea').data('markdown'),
              attachedMarkdown === null) {
              attachedMarkdown = $(this).find('div[data-provider="markdown-preview"]').data('markdown');
          }

          if (attachedMarkdown) {
            attachedMarkdown.blur();
          }
        }
      });

      // Trigger the onFocus hook
      options.onFocus(this);

      return this;
    }

  , blur: function (e) {
      var options = this.$options,
          isHideable = options.hideable,
          editor = this.$editor,
          editable = this.$editable;

      if (editor.hasClass('active') || this.$element.parent().length === 0) {
        editor.removeClass('active');

        if (isHideable) {
          // Check for editable elements
          if (editable.el !== null) {
            // Build the original element
            var oldElement = $('<'+editable.type+'/>'),
                content = this.getContent(),
                currentContent = this.parseContent(content);

            $(editable.attrKeys).each(function(k,v) {
              oldElement.attr(editable.attrKeys[k],editable.attrValues[k]);
            });

            // Get the editor content
            oldElement.html(currentContent);

            editor.replaceWith(oldElement);
          } else {
            editor.hide();
          }
        }

        // Trigger the onBlur hook
        options.onBlur(this);
      }

      return this;
    }


  /*================================ ImgUploader ===============================
   * 图片上传
   *========================================================================= */
  , showImgUpload: function (e) {
      var _this = this,
          imgUploadpanel = this.$imgUploadpanel,
          editor = this.$editor,

          mdUpload = null,
          mdDialog = null,
          mdContent = null,
          mdContentHeader = null,
          mdContentBody = null,
          mdContentFooter = null,
          inputGroup = null,
          localUpload = null,
          localUploadField = null,
          urlInput = null,
          imgStatebar = null,
          cancleButton = null,
          okButton = null,
          imgProgressBar = null,
          imgProgress = null,
          imgPercent = null;

      // 第一次则初始化面板
      if (this.$editor !== null && imgUploadpanel == null) {
        mdUpload = $('<div />', {
          'class': 'md-upload',
          'data-provide': 'markdown-upload'
        }).on('click', function (evt) {
          if ($(evt.target).is('div.md-upload'))
            _this.hideImgUpload();
        });

        mdDialog = $('<div/>', {
          'class': 'md-dialog',
          'data-provide': 'markdown-upload-dialog'
        });

        mdContent = $('<div/>', {
          'class': 'md-content',
          'data-provide': 'markdown-upload-content'
        });

        mdContentHeader = $('<div/>', {
          'class': 'md-content-header',
          'data-provide': 'markdown-upload-content-header'
        }).append($('<i/>', {
          type: 'button',
          // class: 'md-content-header-button gly gly-remove'
          class: 'md-content-header-button glyphicon glyphicon-remove'
        })).on('click', function (evt) {
          if ($(evt.target).is('i.md-content-header-button'))
            _this.hideImgUpload();
        }).append($('<h4/>', {
          class: 'md-content-header-title title',
          text: e.__localize('Image')
        }));

        mdContentBody = $('<div/>', {
          'class': 'md-content-body',
          'data-provide': 'markdown-upload-content-body'
        }).append($('<div/>', {
          class: 'md-content-body-danger',
          text: e.__localize('ImageTip')
        })).append($('<p/>', {
          text: e.__localize('ImageInputTip')
        }));

        inputGroup = $('<div/>', {
          class: 'md-content-body-input-group'
        });

        localUpload = $('<span />', {
          // class: 'md-input-group-addon gly gly-picture'
          class: 'md-input-group-addon glyphicon glyphicon-picture'
        }).on('click', function (evt) {
          if (typeof FormData === "undefined") {
            imgStatebar.html(e.__localize('BrowerSupportTip'));
            return;
          }
          localUploadField.trigger('click');
          return false;
        });

        localUploadField = $('<input>', {
          type: 'file',
          class: 'md-input-insert-image',
          formenctype: 'multipart/form-data'
        }).change(function () {
          _this.imgFileUpload();
        });

        urlInput = $('<input>', {
          type: 'text',
          class: 'md-input-image-url',
          placeholder: 'http://example.com/image.jpg'
        });

        imgProgressBar = $('<div/>', {class: 'md-progress-bar'});

        imgProgress = $('<progress/>', {max: 100, value: 0});

        imgPercent = $('<span/>', {
          text: _this.__localize('Progress') + ' 0%'
        });

        imgProgressBar.append(imgPercent).append(imgProgress);
        inputGroup.append(localUpload).append(localUploadField).append(urlInput);
        mdContentBody.append(inputGroup).append(imgProgressBar);

        mdContentFooter = $('<div/>', {
          'class': 'md-content-footer',
          'data-provide': 'markdown-upload-content-footer'
        });

        imgStatebar = $('<span/>', {class: 'md-state-bar'});

        cancleButton = $('<button/>', {
          class: 'btn btn-default',
          type: 'button',
          text: e.__localize('Cancle')
        });

        cancleButton.bind('click', function () {
          _this.hideImgUpload();
        });

        okButton = $('<button/>', {
          class: 'btn btn-primary',
          text: e.__localize('Insert')
        }).bind('click', function () {
          var link = urlInput.val();
          if (null === link || '' === link) {
            _this.setImgState(_this.__localize('ImageInputTip'));
            return false;
          }
          _this.setImageLink(link);
          _this.setImgPercent(0);
          if (_this.$isFullscreen) {
            _this.$innerPreview.html(marked(_this.$textarea.val()));
          }
          return false;
        });

        mdContentFooter.append(imgStatebar).append(cancleButton).append(okButton);

        mdContent.append(mdContentHeader).append(mdContentBody).append(mdContentFooter);

        mdDialog.append(mdContent);

        editor.append(mdUpload.append(mdDialog));

        this.$imgUploadpanel = mdUpload;
        this.$imgInputfile = localUploadField;
        this.$imgProgress = imgProgress;
        this.$imgPercent = imgPercent;
        this.$imgStatebar = imgStatebar;
        return;
      }

      // 重新打开则初始化状态
      imgProgress = this.$imgProgress;
      if (imgProgress && imgProgress.length > 0) {
        imgProgress = imgProgress.get(0);
      }
      imgProgress.value = 0;
      this.setImgPercent(0);
      this.$imgStatebar.html('');
      imgUploadpanel.show();
    }

  , setImgPercent: function (imgProgress) {
      if (this.$imgPercent) {
        this.$imgPercent.html(this.__localize('Progress') +' '+ imgProgress + '%');
      }
    }

  , setImgState: function (text, color) {
      var _this = this;
      if (_this.$imgStatebar) {
        if (color) {
          _this.$imgStatebar.addClass('md-green');
        }
        _this.$imgStatebar.html(text);
        setTimeout(function () {
          _this.$imgStatebar.html('');
          _this.$imgStatebar.removeClass('md-green');
        }, 3000);
      }
    }

  , imgFileUpload: function () {
      var _this = this,
          imgUrl = this.$options.img.uploadUrl,
          name = this.$options.img.name,
          xhr = null,
          imgProgress = this.$imgProgress,
          file = null,
          maximgFilesize = this.$imgFilesize,
          uploadImgURL = "",
          imgUploadpanel = this.$imgUploadpanel,
          imgInputfile = this.$imgInputfile,
          _imgFilesize = 0,
          _fileName = '',
          _suffixReg = /^.*\.(?:jpg|png|gif)$/,
          _csrftoken = this.$csrftoken,
          _resp = null,
          formData = new FormData();

      if (imgProgress && imgProgress.length > 0) {
        imgProgress = imgProgress.get(0);
      }

      if (null === imgUrl || '' === imgUrl || !imgUrl) {
        _this.setImgState(_this.__localize('UploadPathTip'));
        return;
      }

      if (imgInputfile.length > 0 && imgInputfile[0].files && imgInputfile[0].files.length > 0) {
        formData.append(name, imgInputfile[0].files[0]);
        file = imgInputfile[0].files[0];
        _imgFilesize = file.size;
        _fileName = file.name.toLowerCase();

        if (!_fileName.match(_suffixReg)) {
          _this.setImgState(_this.__localize('SupportTypeTip'));
          return;
        }

        if (_imgFilesize > maximgFilesize) {
          _this.setImgState(_this.__localize('FilesizeTip'));
          return;
        }

        var k, data = _this.$options.img.extradata;
        for (k in data) {
          formData.append(k, data[k]);
        }
        xhr = new XMLHttpRequest();
        xhr.upload.onprogress = function (evt) {
          _this.setImgPercent(Math.round(evt.loaded * 100 / evt.total));
          imgProgress.max = evt.total;
          imgProgress.value = evt.loaded;
        };

        xhr.upload.onload = function () {
          setTimeout(function () {
            _this.setImgPercent(100);
            imgProgress.max = 100;
            // imgProgress.value = 0;
            _this.setImgState(_this.__localize('ProgressLoaded'), true);
          }, 1000);
        };

        xhr.upload.onerror = function () {
          _this.setImgPercent(0);
          imgProgress.max = 100;
          imgProgress.value = 0;

          imgUploadpanel.find('input.md-input-insert-image').val('');
          imgUploadpanel.find('input.md-input-image-url').val('');

          _this.setImgState(_this.__localize('UploadEooroTip'));
        };

        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4 && xhr.status === 200) {
            _resp = $.parseJSON(xhr.responseText);
            if (_resp && !!_resp['url'] && _resp['url'])
              imgUploadpanel.find('input.md-input-image-url').val(_resp.url);
          }
        };

        xhr.open('POST', imgUrl, true);
        if (!this.crossDomain) xhr.setRequestHeader("X-CSRFToken", _csrftoken);
        xhr.setRequestHeader("Cache-Control", "no-cache");
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        xhr.send(formData);
      }
    }

  , setImageLink: function (link) {
      // Give ![] surround the selection and prepend the image link
      var _this = this,
          chunk,
          cursor,
          instance = this,
          selected = instance.getSelection(),
          content = instance.getContent(),
          _link = link;

      if (selected.length === 0) {
        // Give extra word
        chunk = instance.__localize('enter image description here');
      } else {
        chunk = selected.text;
      }

      //link = prompt(e.__localize('Insert Image Hyperlink'), 'http://');

      if (_link !== null &&
          _link !== '' &&
          _link !== 'http://' && (
          _link.substr(0, 4) === 'http' ||
          _link.substr(0, 21) === 'data:image/png;base64')) {

        var sanitizedLink = $('<div>' + _link + '</div>').text();

        // transform selection and set the cursor into chunked text
        instance.replaceSelection('![' + chunk + '](' + sanitizedLink + ' "' + instance.__localize('enter image title here') + '")');
        cursor = selected.start + 2;

        // Set the next tab
        instance.setNextTab(instance.__localize('enter image title here'));

        // Set the cursor
        instance.setSelection(cursor, cursor + chunk.length);

        this.hideImgUpload();
      }
    }

  , hideImgUpload: function () {
      var imgUploadpanel = this.$imgUploadpanel,
          textarea = this.$textarea;

      if (null !== imgUploadpanel) {
        textarea.focus();
        imgUploadpanel.find('input.md-input-insert-image').val('');
        imgUploadpanel.find('input.md-input-image-url').val('');
        imgUploadpanel.hide();
        this.$imgUploadMode = false;
      }
    }

/*=================================== CodeUploader =============================
 * 代码上传
 *=========================================================================== */
  , showCodeUpload: function(e) {
      var _this = this,
      uploadCodePanel = this.$uploadCodePanel,
      editor = this.$editor,
      mdPanel = null,
      mdDialog = null,
      mdContent = null,
      mdHeader = null,
      mdBody = null,
      mdFooter = null,
      mdTextarea = null,
      mdChoiceBarHolder = null,
      mdStateBar = null,
      mdCancleButton = null,
      mdOkButton = null;

      if (this.$editor !== null && uploadCodePanel == null) {
        mdPanel = $('<div />', {
          'class': 'md-upload',
          'data-provide': 'markdown-upload'
        }).on('click', function(evt) {
          if ($(evt.target).is('div.md-upload')) _this.hideCodeUpload();
        });

        mdDialog = $('<div/>', {
          'class': 'md-dialog',
          'data-provide': 'markdown-upload-dialog'
        });

        mdContent = $('<div/>', {
          'class': 'md-content',
          'data-provide': 'markdown-upload-content'
        });

        mdHeader = $('<div/>', {
          'class': 'md-content-header',
          'data-provide': 'markdown-upload-content-header'
        }).append($('<i/>', {
          type: 'button',
          class: 'md-content-header-button glyphicon glyphicon-remove'
        })).on('click', function(evt) {
          if ($(evt.target).is('i.md-content-header-button')) _this.hideCodeUpload();
        }).append($('<h4/>', {
          class: 'md-content-header-title title',
          text: e.__localize('Code')
        }));

        mdBody = $('<div/>', {
          'class': 'md-content-body',
          'data-provide': 'markdown-upload-content-body'
        });

        mdTextarea = $('<textarea/>', {
          'class': 'md-content-body-codecontent',
          // text: e.__localize('CodeTip'),
          'placeholder': e.__localize('CodeTip')
        });

        mdChoiceBarHolder = $('<div/>', {'class': 'choicebar-holder'});
        mdBody.append(mdTextarea);
        mdBody.append(mdChoiceBarHolder);

        mdFooter = $('<div/>', {
          'class': 'md-content-footer',
          'data-provide': 'markdown-upload-content-footer'
        });

        mdStateBar = $('<span/>', {
          class: 'md-state-bar'
        });

        mdCancleButton = $('<button/>', {
          'class': 'btn btn-default',
          'type': 'button',
          'text': e.__localize('Cancle')
        });
        mdCancleButton.bind('click', function() {
          _this.hideCodeUpload();
        });

        mdOkButton = $('<button/>', {
          class: 'btn btn-primary',
          text: e.__localize('Insert')
        });
        mdOkButton.bind('click', function() {
          var code = mdTextarea.val();
          if (null === code || '' === code) {
            _this.setCodeState(_this.__localize('CodeInputTip'));
            return false;
          }

          _this.codeUpload();
          if (_this.$isFullscreen) {
            _this.$innerPreview.html(marked(_this.$textarea.val()));
          }
          return false;
        });

        mdFooter.append(mdStateBar).append(mdCancleButton).append(mdOkButton);

        mdContent.append(mdHeader).append(mdBody).append(mdFooter);

        mdDialog.append(mdContent);

        editor.append(mdPanel.append(mdDialog));

        this.$uploadCodePanel = mdPanel;
        this.$codeTextarea = mdTextarea;
        this.$codeStateBar = mdStateBar;
        e.setChoiceBar();
        return;
      }

      // 重新打开则初始化状态
      this.$codeTextarea.val('');
      e.setCodeState('');
      e.setChoiceBar();
      uploadCodePanel.show();
    }

  , setCodeState: function (text, color) {
        var _this = this;
        if (_this.$codeStateBar) {
            if (color) {
                _this.$codeStateBar.addClass('md-green');
            }
            _this.$codeStateBar.html(text);
            setTimeout(function () {
                _this.$codeStateBar.html('');
                _this.$codeStateBar.removeClass('md-green');
            }, 3000);
        }
    }

  , codeUpload: function () {
      var _this = this,
          codeUrl = this.$options.code.uploadUrl,
          uploadCodePanel = this.$uploadCodePanel,
          codeTextarea = this.$codeTextarea,
          codeChoiceBar = this.$codeChoiceBar,
          _csrftoken = this.$csrftoken,
          xhr = null,
          _resp = null,
          _ischecked = false,
          formData = new FormData();

      if (null === codeUrl || '' === codeUrl || !codeUrl) {
          _this.setCodeState(_this.__localize('CodeUploadPathTip'));
          return;
      }

      if (null !== codeTextarea && '' !== codeTextarea) {
          formData.append('content', codeTextarea.val());
      } else {
        _this.setCodeState(_this.__localize('CodeInputTip'));
        return;
      }

      if (codeChoiceBar) {
        codeChoiceBar.find('input[type="radio"]').each(function () {
          if (this.checked) {
            if (_this.$options.code.name)
              formData.append(_this.$options.code.name, $(this).val());
            _ischecked = true;
          }
        });
        if (!_ischecked) {
          _this.setCodeState(_this.__localize('CodeChoiceTip'));
          return;
        }
      }

      if ('inPage' === codeUrl) {
        _this.setCodeTag(codeTextarea.val(), true);
      } else {
        var k, data = _this.$options.code.extradata;
        for (k in data) {
          formData.append(k, data[k]);
        }
        xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4 && xhr.status === 200) {
            _resp = $.parseJSON(xhr.responseText);
            if (_resp && !!_resp['pk'] && _resp['pk']) {
              _this.setCodeTag(_resp.pk);
            } else {
              _this.setCodeState(_this.__localize('WrongFormatTip'));
              return;
            }
          } else {
            _this.setCodeState(_this.__localize('ServerErrorTip'));
            return;
          }
        }
        xhr.open('POST', codeUrl, true);
        if (!this.crossDomain)
          xhr.setRequestHeader("X-CSRFToken", _csrftoken);
        xhr.setRequestHeader("Cache-Control", "no-cache");
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        xhr.send(formData);
      }

    }

  , setCodeTag: function (tag, inPageMode) {
      var _this = this,
          cursor,
          instance = this,
          selected = instance.getSelection();

      if (tag !== null && tag !== '') {
        if (!inPageMode) {
          instance.replaceSelection('\n{{ code: "' + tag + '" }}\n\n');
        } else {
          instance.replaceSelection('\n```\n' + tag + '\n```\n');
        }
        cursor = selected.end + tag.length + 17;

        // TODO
        // Set the next tab

        // Set the cursor
        instance.setSelection(cursor, cursor);

        _this.hideCodeUpload();
      }
    }

  , __setChoice: function (choices) {
      var _this = this,
          name = this.$options.code.name,
          ul = null,
          li = null,
          input = null,
          i = null,
          Bar = null;
      if (choices && choices.constructor == Array) {
        ul = $('<ul />', {'class': 'dowebok'});
        ul.append($('<li />', {
          'class': 'md-choicebar-li'
        }).append($('<input type="button" data-labelauty="'+
        _this.__localize('ChoseLanguageTip')+'">')));

        for (i in choices) {
          if (typeof choices[i] === 'string') {
            li = $('<li />', {
              'class': 'md-choicebar-li'
            }).append($('<input/>', {
              'data-labelauty': choices[i],
              'type': 'radio',
              'name': name,
              'value': choices[i]
            }));
          } else {
            li = $('<li />', {
              'class': 'md-choicebar-li'
            }).append($('<input/>', {
              'data-labelauty': choices[i]['k'],
              'type': 'radio',
              'name': name,
              'value': choices[i]['v']
            }));
          }
          ul.append(li);
        }
        Bar = $('<div/>', {
          'class': 'md-content-body-codechoicebar',
          'data-provide': 'markdown-content-body-codechoicebar'
        });
        Bar.append(ul).find('input').each(function() {$(this).labelauty();});

        $('.choicebar-holder', _this.$uploadCodePanel).html(Bar);
        _this.$codeChoiceBar = Bar;
      }
  }

  , setChoiceBar: function () {
      if (this.$codeChoiceBar) {
        this.$codeChoiceBar.find('input[type="radio"]').each(function () {
            $(this).attr('checked', false);
        });
        return;
      }

      var _this = this,
          choiceUrl = this.$options.code.choiceUrl,
          chs = this.$options.code.choices;


      if (!choiceUrl && !chs) {
        return;
      } else if (chs) {
        _this.__setChoice(chs);
      } else {
        $.ajax({
          url: choiceUrl,
          type: "get",
          dataType: "json",
          complete: function(resp){
            if (resp.readyState == 4 &&
                !!resp['responseJSON'] &&
                !!resp.responseJSON['choices'] &&
                resp.responseJSON['choices']) {
              chs = resp.responseJSON.choices;
              _this.__setChoice(chs);
              return;
            }
            _this.setCodeState(_this.__localize('HttpRequestErrorTip'));
          }
        });
      }
  }

  , hideCodeUpload: function () {
      var uploadCodePanel = this.$uploadCodePanel,
          codeTextarea = this.$codeTextarea,
          codeChoiceBar = this.$codeChoiceBar,
          textarea = this.$textarea;

      if (null !== uploadCodePanel) {
        textarea.focus();
        codeTextarea.find('textarea.md-content-body-codecontent').val('');
        if (codeChoiceBar)
          codeChoiceBar.find('input[type="radio"]').each(function () {
              $(this).attr('checked', false);
          });
        uploadCodePanel.hide();
        this.$codeUploadMode = false;
      }
    }

/*=================================== LocalCacher =============================
 * 本地缓存
 *=========================================================================== */
  , localCacheGet: function() {
      var _this = this,
          key = _this.$options.cache.key,
          session = this.$options.cache.session || '',
          success = true;

      if (_this.$options.cache.enable && window.localStorage){
          var greedy = _this.$options.cache.greedy,
              textarea = _this.$textarea,
              localTimestamp = localStorage.getItem(session+'timestamp'),
              sessionTimestamp = _this.$options.cache.timestamp,
              update = false,
              $form = _this.$form,
              value = null,
              i=0;

          if (sessionTimestamp && localTimestamp &&
              sessionTimestamp !== '' && localTimestamp !== '') {
            sessionTimestamp = new Date(sessionTimestamp);
            localTimestamp = new Date(localTimestamp);
            if (localTimestamp >= sessionTimestamp)
              update = true;
          }


          if (greedy !== true && key && '' !== key) {
            value = localStorage.getItem(session+key);
            if (!_this.$textarea.val() || value && update)
              _this.$textarea.val(value);
            _this.$localCacheKeys.push(session+key);
            return;
          }

          if ($form) {
            $('input[name]', $form).each(function() {
              if (this.type === 'radio' || this.type === 'checkbox') {
                _this.$localCacheKeys.push(session+key+this.type+this.name+this.value);
                value = localStorage.getItem(session+key+this.type+this.name+this.value);
                if (value === 'true') {
                  // 这里会产生一点点误差(异地编辑和非正常退出导致的)
                  $(this).attr('checked', true);
                } else {
                  $(this).attr('checked', false);
                }
              } else if (this.type === 'text') {
                _this.$localCacheKeys.push(session+key+this.type+this.name);
                value = localStorage.getItem(session+key+this.type+this.name);
                if (!$(this).val() || value && update)
                  $(this).val(value);
              }
              // console.log('SET:',this.type+this.name, value);
            });
            $('textarea[name]', $form).each(function() {
              _this.$localCacheKeys.push(session+key+this.type+this.name);
              value = localStorage.getItem(session+key+this.type+this.name);
              // console.log('SET:',this.type+this.name, value, $(this).val());
              if (!$(this).val() || value && update)
                $(this).val(value);
            });
          }
      }
  }

  , localCacheSet: function () {
      var _this = this,
          key = this.$options.cache.key,
          session = this.$options.cache.session || '',
          success = true;

      // 每5秒就保存一次
      if (this.$options.cache.enable && window.localStorage){
        setInterval(function () {
          if (success !== true)
            return

          var greedy = _this.$options.cache.greedy,
              textarea = _this.$textarea,
              form = _this.$editor.parent(), i=0;

          if (session) {
            localStorage.setItem(session+'timestamp', Date());
            // console.log('set sessionTimestamp:', Date());
          }

          if (greedy !== true && key && '' !== key) {
            localStorage.setItem(session+key, textarea.val());
            return;
          }

          while (!form.is('form') &&
                !form.is('body') &&
                i < 20) {
            form = form.parent();
            i++;
          }

          if (form.is('form')) {
            $('input[name]', form).each(function() {
              if (this.type === 'radio') {
                // console.log('GET:', key+this.type+this.name+this.value, 'checked:', this.checked);
                localStorage.setItem(session+key+this.type+this.name+this.value, this.checked);
              } else if (this.type === 'checkbox' && this.value) {
                localStorage.setItem(session+key+this.type+this.name+this.value, this.checked);

              } else if (this.type === 'text') {
                localStorage.setItem(session+key+this.type+this.name, this.value);
              }
            });
            $('textarea[name]', form).each(function() {
              localStorage.setItem(session+key+this.type+this.name, this.value);
            });
          } else {
            success = false;
          }
        }, 5000);
      }
  }

  , localCacheClean: function () {
    var keys = this.$localCacheKeys, i;
    if (this.$options.cache.enable && window.localStorage)
      for (i in keys) {
        localStorage.removeItem(keys[i]);
      }
  }

  , __setForm: function () {
      var _this = this;
      this.$form.submit(function(e){
        if (_this.$options.form.ajaxSubmit === true) {
          e.preventDefault();
          var f = this, k, err,
              redirectTo = _this.$options.form.redirectTo,
              errClsSuffix = _this.$options.form.errClsSuffix;

          $.ajax({
            url: f.action,
            type: f.method,
            data: $(f).serialize(),
            dataType: 'json',
            success: function(e){
              if (e.status === 'success') {
                f.reset();
                _this.localCacheClean();
                window.location.href=e.redirect || redirectTo || '.';
              } else if (e.errors) {
                for (k in e.fields) {
                  err = $('*[name="'+e.fields[k]+'"]', f);
                  if (e.fields[k] in e.errors) {
                    err.parentsUntil("form").filter("div.form-group").addClass('has-error');
                    err = e.errors[e.fields[k]];
                  } else {
                    err.parentsUntil("form").filter("div.form-group").removeClass('has-error');
                    err = '';
                  }
                  $('.'+e.fields[k]+errClsSuffix+':first', f).html(err);
                }
              }
            }
          });

        } else {
          _this.localCacheClean();
        }
      });
  }
  };

 /* MARKDOWN PLUGIN DEFINITION
  * ========================== */

  var old = $.fn.markdown;

  $.fn.markdown = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('markdown')
        , options = typeof option == 'object' && option;
      if (!data) $this.data('markdown', (data = new Markdown(this, options)))
    })
  };

  $.fn.markdown.messages = {};

  $.fn.markdown.defaults = {
    /* Editor Properties */
    autofocus: false,
    hideable: false,
    savable: false,
    width: 'inherit',
    height: 'inherit',
    resize: 'none',
    iconlibrary: 'fa', //'glyph',
    language: 'en',
    initialstate: 'editor',
    parser: null,

    // 为图片域和代码域添加默认配置项
    img: {
      showPanel: false,
      name: 'img',
      uploadUrl: null,
      extradata: {} // if not null, then extradata will be submited together
    },
    code: {
      showPanel: false,
      name: 'code_type',
      choices: null, //['A', 'B', 'C', {'k': 'DD', 'v': 'd'}]
      choiceUrl: null, // resp.choices
      uploadUrl: 'inPage', // if inPage, the codes will together with the main content
      extradata: {}
    },
    cache: {
        key: 'md',
        enable: true,
        greedy: false,
        session: null,
        timestamp: null // 用于比对当前工作副本和本地缓存的数据
    },

    form: {
      ajaxSubmit: false,
      redirectTo: '.',
      errClsSuffix: '-error-holder'
    },

    /* Buttons Properties */
    buttons: [
      [{
        name: 'groupFont',
        data: [
        { // B
          name: 'cmdBold',
          hotkey: 'Ctrl+B',
          title: 'Bold',
          icon: { glyph: 'glyphicon glyphicon-bold', fa: 'fa fa-bold', 'fa-3': 'icon-bold' },
          callback: function(e){
            // Give/remove ** surround the selection
            var chunk, cursor, selected = e.getSelection(), content = e.getContent();

            if (selected.length === 0) {
              // Give extra word
              chunk = e.__localize('strong text');
            } else {
              chunk = selected.text;
            }

            // transform selection and set the cursor into chunked text
            if (content.substr(selected.start-2,2) === '**'
                && content.substr(selected.end,2) === '**' ) {
              e.setSelection(selected.start-2,selected.end+2);
              e.replaceSelection(chunk);
              cursor = selected.start-2;
            } else {
              e.replaceSelection('**'+chunk+'**');
              cursor = selected.start+2;
            }

            // Set the cursor
            e.setSelection(cursor,cursor+chunk.length);
          }
        },
        { // I
          name: 'cmdItalic',
          title: 'Italic',
          hotkey: 'Ctrl+I',
          icon: { glyph: 'glyphicon glyphicon-italic', fa: 'fa fa-italic', 'fa-3': 'icon-italic' },
          callback: function(e){
            // Give/remove * surround the selection
            var chunk, cursor, selected = e.getSelection(), content = e.getContent();

            if (selected.length === 0) {
              // Give extra word
              chunk = e.__localize('emphasized text');
            } else {
              chunk = selected.text;
            }

            // transform selection and set the cursor into chunked text
            if (content.substr(selected.start-1,1) === '_'
                && content.substr(selected.end,1) === '_' ) {
              e.setSelection(selected.start-1,selected.end+1);
              e.replaceSelection(chunk);
              cursor = selected.start-1;
            } else {
              e.replaceSelection('_'+chunk+'_');
              cursor = selected.start+1;
            }

            // Set the cursor
            e.setSelection(cursor,cursor+chunk.length);
          }
        }]
      },
      {
        name: 'groupLink',
        data: [
        { // L
          name: 'cmdUrl',
          title: 'URL/Link',
          hotkey: 'Ctrl+L',
          icon: { glyph: 'glyphicon glyphicon-link', fa: 'fa fa-link', 'fa-3': 'icon-link' },
          callback: function(e){
            // Give [] surround the selection and prepend the link
            var chunk, cursor, selected = e.getSelection(), content = e.getContent(), link;

            if (selected.length === 0) {
              // Give extra word
              chunk = e.__localize('enter link description here');
            } else {
              chunk = selected.text;
            }

            link = prompt(e.__localize('Insert Hyperlink'),'http://');

            if (link !== null && link !== '' && link !== 'http://' && link.substr(0,4) === 'http') {
              var sanitizedLink = $('<div>'+link+'</div>').text();

              // transform selection and set the cursor into chunked text
              e.replaceSelection('['+chunk+']('+sanitizedLink+')');
              cursor = selected.start+1;

              // Set the cursor
              e.setSelection(cursor,cursor+chunk.length);
            }
          }
        },
        { // Q
          name: 'cmdQuote',
          hotkey: 'Ctrl+Q',
          title: 'Quote',
          icon: { glyph: 'glyphicon glyphicon-comment', fa: 'fa fa-quote-left', 'fa-3': 'icon-quote-left' },
          callback: function(e) {
            // Prepend/Give - surround the selection
            var chunk, cursor, selected = e.getSelection(), content = e.getContent();

            // transform selection and set the cursor into chunked text
            if (selected.length === 0) {
              // Give extra word
              chunk = e.__localize('quote here');

              e.replaceSelection('> '+chunk);

              // Set the cursor
              cursor = selected.start+2;
            } else {
              if (selected.text.indexOf('\n') < 0) {
                chunk = selected.text;

                e.replaceSelection('> '+chunk);

                // Set the cursor
                cursor = selected.start+2;
              } else {
                var list = [];

                list = selected.text.split('\n');
                chunk = list[0];

                $.each(list,function(k,v) {
                  list[k] = '> '+v;
                });

                e.replaceSelection('\n\n'+list.join('\n'));

                // Set the cursor
                cursor = selected.start+4;
              }
            }

            // Set the cursor
            e.setSelection(cursor,cursor+chunk.length);
          }
        },
        { // i
          name: 'cmdImage',
          title: 'Image',
          hotkey: 'Ctrl+G',
          icon: { glyph: 'glyphicon glyphicon-picture', fa: 'fa fa-picture-o', 'fa-3': 'icon-picture' },
          callback: function(e){
            if (e.$options.img.showPanel) {
              e.$imgUploadMode = true;
              e.showImgUpload(e);
            } else {
              // Give ![] surround the selection and prepend the image link
              var chunk, cursor, selected = e.getSelection(), content = e.getContent(), link;

              if (selected.length === 0) {
                // Give extra word
                chunk = e.__localize('enter image description here');
              } else {
                chunk = selected.text;
              }

              link = prompt(e.__localize('Insert Image Hyperlink'),'http://');

              if (link !== null && link !== '' && link !== 'http://' && link.substr(0,4) === 'http') {
                var sanitizedLink = $('<div>'+link+'</div>').text();

                // transform selection and set the cursor into chunked text
                e.replaceSelection('!['+chunk+']('+sanitizedLink+' "'+e.__localize('enter image title here')+'")');
                cursor = selected.start+2;

                // Set the next tab
                e.setNextTab(e.__localize('enter image title here'));

                // Set the cursor
                e.setSelection(cursor,cursor+chunk.length);
              }
            }
          }
        },
        { // Code
          name: 'cmdCode',
          hotkey: 'Ctrl+K',
          title: 'Code',
          icon: { glyph: 'glyphicon glyphicon-asterisk', fa: 'fa fa-code', 'fa-3': 'icon-code' },
          callback: function(e) {
            if (e.$options.code.showPanel) {
              e.$codeUploadMode = true;
              e.showCodeUpload(e);
            } else {
              // Give/remove ** surround the selection
              var chunk, cursor, selected = e.getSelection(), content = e.getContent();

              if (selected.length === 0) {
                // Give extra word
                chunk = e.__localize('code text here');
              } else {
                chunk = selected.text;
              }

              // transform selection and set the cursor into chunked text
              if (content.substr(selected.start-4,4) === '```\n'
                  && content.substr(selected.end,4) === '\n```') {
                e.setSelection(selected.start-4, selected.end+4);
                e.replaceSelection(chunk);
                cursor = selected.start-4;
              } else if (content.substr(selected.start-1,1) === '`'
                  && content.substr(selected.end,1) === '`') {
                e.setSelection(selected.start-1,selected.end+1);
                e.replaceSelection(chunk);
                cursor = selected.start-1;
              } else if (content.indexOf('\n') > -1) {
                e.replaceSelection('```\n'+chunk+'\n```');
                cursor = selected.start+4;
              } else {
                e.replaceSelection('`'+chunk+'`');
                cursor = selected.start+1;
              }

              // Set the cursor
              e.setSelection(cursor,cursor+chunk.length);
            }
          }
        }]
      },
      {
        name: 'groupMisc',
        data: [
          { // H
            name: 'cmdHeading',
            title: 'Heading',
            hotkey: 'Ctrl+H',
            icon: { glyph: 'glyphicon glyphicon-header', fa: 'fa fa-header', 'fa-3': 'icon-font' },
            callback: function(e){
              // Append/remove ### surround the selection
              var chunk, cursor, selected = e.getSelection(), content = e.getContent(), pointer, prevChar;

              if (selected.length === 0) {
                // Give extra word
                chunk = e.__localize('heading text');
              } else {
                chunk = selected.text + '\n';
              }

              // transform selection and set the cursor into chunked text
              if ((pointer = 4, content.substr(selected.start-pointer,pointer) === '### ')
                  || (pointer = 3, content.substr(selected.start-pointer,pointer) === '###')) {
                e.setSelection(selected.start-pointer,selected.end);
                e.replaceSelection(chunk);
                cursor = selected.start-pointer;
              } else if (selected.start > 0 && (prevChar = content.substr(selected.start-1,1), !!prevChar && prevChar != '\n')) {
                e.replaceSelection('\n\n### '+chunk);
                cursor = selected.start+6;
              } else {
                // Empty string before element
                e.replaceSelection('### '+chunk);
                cursor = selected.start+4;
              }

              // Set the cursor
              e.setSelection(cursor,cursor+chunk.length);
            }
          },
          { // uo
            name: 'cmdList',
            hotkey: 'Ctrl+U',
            title: 'Unordered List',
            icon: { glyph: 'glyphicon glyphicon-list', fa: 'fa fa-list', 'fa-3': 'icon-list-ul' },
            callback: function(e){
              // Prepend/Give - surround the selection
              var chunk, cursor, selected = e.getSelection(), content = e.getContent();

              // transform selection and set the cursor into chunked text
              if (selected.length === 0) {
                // Give extra word
                chunk = e.__localize('list text here');

                e.replaceSelection('- '+chunk);
                // Set the cursor
                cursor = selected.start+2;
              } else {
                if (selected.text.indexOf('\n') < 0) {
                  chunk = selected.text;

                  e.replaceSelection('- '+chunk);

                  // Set the cursor
                  cursor = selected.start+2;
                } else {
                  var list = [];

                  list = selected.text.split('\n');
                  chunk = list[0];

                  $.each(list,function(k,v) {
                    list[k] = '- '+v;
                  });

                  e.replaceSelection('\n\n'+list.join('\n'));

                  // Set the cursor
                  cursor = selected.start+4;
                }
              }

              // Set the cursor
              e.setSelection(cursor,cursor+chunk.length);
            }
          },
          { // oo
            name: 'cmdListO',
            hotkey: 'Ctrl+O',
            title: 'Ordered List',
            icon: { glyph: 'glyphicon glyphicon-th-list', fa: 'fa fa-list-ol', 'fa-3': 'icon-list-ol' },
            callback: function(e) {

              // Prepend/Give - surround the selection
              var chunk, cursor, selected = e.getSelection(), content = e.getContent();

              // transform selection and set the cursor into chunked text
              if (selected.length === 0) {
                // Give extra word
                chunk = e.__localize('list text here');
                e.replaceSelection('1. '+chunk);
                // Set the cursor
                cursor = selected.start+3;
              } else {
                if (selected.text.indexOf('\n') < 0) {
                  chunk = selected.text;

                  e.replaceSelection('1. '+chunk);

                  // Set the cursor
                  cursor = selected.start+3;
                } else {
                  var list = [];

                  list = selected.text.split('\n');
                  chunk = list[0];

                  $.each(list,function(k,v) {
                    list[k] = '1. '+v;
                  });

                  e.replaceSelection('\n\n'+list.join('\n'));

                  // Set the cursor
                  cursor = selected.start+5;
                }
              }

              // Set the cursor
              e.setSelection(cursor,cursor+chunk.length);
            }
          },
          { // hr
            name: 'cmdHr',
            // hotkey: 'Ctrl+r',
            title: 'hr',
            btnClass: 'btn btn-default btn-sm',
            icon: { glyph: 'glyphicon glyphicon-flag', fa: 'fa fa-minus' },
            callback: function(e){}
          }
        ]
      },
      {
        name: 'groupUtil',
        data: [{
          name: 'cmdEmoji',
          hotkey: '',
          title: 'Emoji',
          btnClass: 'btn btn-default btn-sm',
          icon: { glyph: 'glyphicon glyphicon-flag', fa: 'fa fa-smile-o' },
          callback: function(e){}
      }, {
          name: 'cmdPreview',
          // toggle: true,
          hotkey: 'Ctrl+P',
          title: 'Preview',
          // btnText: 'Preview',
          btnClass: 'btn btn-default btn-sm',
          icon: { glyph: 'glyphicon glyphicon-search', fa: 'fa fa-eye-slash', 'fa-3': 'icon-eye-slash' },
          callback: function(e){
            // Check the preview mode and toggle based on this flag
            var isPreview = e.$isPreview,content;

            if (isPreview === false) {
              // Give flag that tell the editor enter preview mode
              e.showPreview();
            } else {
              e.hidePreview();
            }
          }
        }, {
          name: 'cmdHelp',
          hotkey: '',
          title: 'Help',
          btnClass: 'btn btn-default btn-sm',
          icon: { glyph: 'glyphicon glyphicon-flag', fa: 'fa fa-question' },
          callback: function(e){}
      }]
      }]
    ],
    additionalButtons:[], // Place to hook more buttons by code
    reorderButtonGroups:[],
    hiddenButtons:[], // Default hidden buttons
    disabledButtons:[], // Default disabled buttons
    footer: '',
    fullscreen: {
      enable: true,
      icons: {
        fullscreenOn: {
          glyph: 'glyphicon glyphicon-fullscreen',
          fa: 'fa fa-expand',
          'fa-3': 'icon-resize-full'
        },
        fullscreenOff: {
          glyph: 'glyphicon glyphicon-screenshot',
          fa: 'fa fa-compress',
          'fa-3': 'icon-resize-small'
        }
      }
    },

    /* Events hook */
    onShow: function (e) {},
    onPreview: function (e) {},
    onSave: function (e) {},
    onBlur: function (e) {},
    onFocus: function (e) {},
    onChange: function(e) {},
    onFullscreen: function(e) {},
    onSelect: function (e) {}
  };

  $.fn.markdown.Constructor = Markdown;


 /* MARKDOWN NO CONFLICT
  * ==================== */

  $.fn.markdown.noConflict = function () {
    $.fn.markdown = old;
    return this;
  };

  /* MARKDOWN GLOBAL FUNCTION & DATA-API
  * ==================================== */
  var initMarkdown = function(el) {
    var $this = el;

    if ($this.data('markdown')) {
      $this.data('markdown').showEditor();
      return;
    }

    $this.markdown()
  };

  var blurNonFocused = function(e) {
    var $activeElement = $(document.activeElement);

    // Blur event
    $(document).find('.md-editor').each(function(){
      var $this            = $(this),
          focused          = $activeElement.closest('.md-editor')[0] === this,
          attachedMarkdown = $this.find('textarea').data('markdown') ||
                             $this.find('div[data-provider="markdown-preview"]').data('markdown');

      if (attachedMarkdown && !focused) {
        attachedMarkdown.blur();
      }
    })
  };

  $(document)
    .on('click.markdown.data-api', '[data-provide="markdown-editable"]', function (e) {
      initMarkdown($(this));
      e.preventDefault();
    })
    .on('click focusin', function (e) {
      blurNonFocused(e);
    })
    .ready(function(){
      $('textarea[data-provide="markdown"]').each(function(){
        initMarkdown($(this));
      })
    });

}(window.jQuery);
