jQuery.extend({
    reverse: function (url_name) {
        var Url = '/utils/reverse?url=' + url_name;
        console.log(url_name);
        xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                console.log(xhr.responseText, 'ok');
                return xhr.responseText;
            }
        };
        xhr.open('GET', Url, true);
        xhr.setRequestHeader("Cache-Control", "no-cache");
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        xhr.send();
    }
});
