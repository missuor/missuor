!function ($) {

  "use strict"; // jshint ;_;

  /* LIBRARY CLASS DEFINITION
   * ========================== */

  var DefClassName = function (element, options) {
    var opts = [];
    $.each(opts, function(_, opt){
      if (typeof $(element).data(opt) !== 'undefined') {
        options = typeof options == 'object' ? options : {}
        options[opt] = $(element).data(opt)
      }
    });

    // Class Properties
    this.$ns           = 'file-uploader';
    this.$element      = $(element);
    this.$editable     = {el:null, type:null,attrKeys:[], attrValues:[], content:null};
    this.$options      = $.extend(true, {}, options, this.$element.data('options'));
    this.$csrftoken = typeof $.cookie === 'function' ? $.cookie('csrftoken'):'x';

    this.showUploader();
  };

  DefClassName.prototype = {

    constructor: DefClassName,

    showUploader: function () {


    }
  };


 /* LIBRARY PLUGIN DEFINITION
  * ========================== */

  var old = $.fn.defclassname;

  $.fn.defclassname = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('defclassname')
        , options = typeof option == 'object' && option;
      if (!data) $this.data('defclassname', (data = new DefClassName(this, options)))
    })
  };

  $.fn.defclassname.messages = {};

  $.fn.defclassname.defaults = {

  };

  $.fn.defclassname.Constructor = DefClassName;

 /* LIBRARY NO CONFLICT
  * ==================== */

  $.fn.defclassname.noConflict = function () {
    $.fn.defclassname = old;
    return this;
  };


  /* LIBRARY GLOBAL FUNCTION & DATA-API
  * ==================================== */
  var initDefClassName = function(el) {
    var $this = el;

    if ($this.data('defclassname')) {
      $this.data('defclassname').showEditor();
      return;
    }

    $this.defclassname()
  };



  var blurNonFocused = function(e) {
    var $activeElement = $(document.activeElement);

    // Blur event
    $(document).find('.md-editor').each(function(){
      var $this            = $(this),
          focused          = $activeElement.closest('.md-editor')[0] === this,
          attachedDefClassName = $this.find('textarea').data('defclassname') ||
                             $this.find('div[data-provider="defclassname-preview"]').data('defclassname');

      if (attachedDefClassName && !focused) {
        attachedDefClassName.blur();
      }
    })
  };

  $(document)
    .on('click.defclassname.data-api', '[data-provide="defclassname-editable"]', function (e) {
      initDefClassName($(this));
      e.preventDefault();
    })
    .on('click focusin', function (e) {
      blurNonFocused(e);
    })
    .ready(function(){
      $('textarea[data-provide="defclassname"]').each(function(){
        initDefClassName($(this));
      })
    });

}(jQuery || this.jQuery || window.jQuery);