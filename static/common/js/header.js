$(document).ready(function(){
  var div = $('div.navbar-form-holder'),
      form = $('form', div);
      input = $('input[type="text"]', div),
      header = $('nav.header'),
      holder = $('<div />', {
        'class': 'nav-holder',
        'width': '100%',
        'display': 'block'
      });
  div.after(holder);
  holder.css({'height': header.outerHeight()+'px'});

  input.on('click', function (e) {
    input.css({'background': '#fff'});
  })
  .on('blur', function (e) {
    if (input.val().length === 0) {
      input.css({'background': '#555'});
    } else {
      input.css({'background': '#fff'});
    }
  }).keyup(function (e) {
    if (e.keyCode == 13 && input.val().length > 0) {
      form.submit();
    }
  });

  $(".dropdown").click(function() {
    var width = $(this).width()
    var margin_right = $(this).css("margin-right");
    $(this).find('ul[class="dropdown-menu"]').each(function() {
      $(this).width(width + margin_right + 'px')
      //console.log($(this).offsetLeft)
    });
  });

	var isRunning = false,
      scrollDirection = function (e) {
        if (isRunning)
          return;
        isRunning = true;
        e=e || window.event;
        var x = e.wheelDelta || e.detail,
            nav = $('nav.header'),
            w = $(window);
        if (x < 0 && w.scrollTop() > 500) {
          nav.fadeOut(500);
        } else if (x > 0) {
          nav.fadeIn(500);
        }
        if (w.scrollTop() > 300) {
          setTimeout(function () {isRunning = false;}, 500);
        } else {
          isRunning = false;
        }
      }
  if(document.addEventListener) {
      document.addEventListener('DOMMouseScroll',scrollDirection, false);
  }//W3C
  window.onmousewheel=document.onmousewheel=scrollDirection;//IE/Opera/Chrome
});