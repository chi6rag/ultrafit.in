;
(function ($) {

    /* ########### jQuery Cookie Plugin #############  */
    $.cookie = function (g, b, a) {
        if (1 < arguments.length && (!/Object/.test(Object.prototype.toString.call(b)) || null === b || void 0 === b)) {
            a = $.extend({}, a);
            if (null === b || void 0 === b) a.expires = -1;
            if ("number" === typeof a.expires) {
                var d = a.expires,
                    c = a.expires = new Date;
                c.setDate(c.getDate() + d)
            }
            b = "" + b;
            return document.cookie = [encodeURIComponent(g), "=", a.raw ? b : encodeURIComponent(b), a.expires ? "; expires=" + a.expires.toUTCString() : "", a.path ? "; path=" + a.path : "", a.domain ? "; domain=" + a.domain : "", a.secure ? "; secure" : ""].join("")
        }
        for (var a = b || {}, d = a.raw ? function (a) {
                return a
            } : decodeURIComponent, c = document.cookie.split("; "), e = 0, f; f = c[e] && c[e].split("="); e++) if (d(f[0]) === g) return d(f[1] || "");
        return null
    };

    $(window).load(function () {

        var cookieDiv = $('#cookie_popup');

        if ($.cookie('cookie_popup') != '1') {

            cookieDiv.slideDown();
        };

        $('.cookie_button').click(function () {

            cookieDiv.slideUp();
            $.cookie('cookie_popup', '1', {
                expires: 365,
                path: '/'
            });
            return false;

        });

    });

})(jQuery);