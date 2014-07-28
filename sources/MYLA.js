var sc_onload_ie = false;
function populate() {
    // Declaring variables
    __sc = { b: "", bs: "1", c: "17123", s: "", n: "", e: "", t: "", o: "", p: "", i: "", v1: "", v2: "", q1: "", q2: "", q3: "", u: "", d1: "", d2: "", cu1: "", cu2: "", w: "", y: "", uc: "1", cc: "", ct: "30", st: "1800", er: "", ifs: "", sfs: "", ctd: "" };
    // Status recognition
    __sc.w = __SCO.title();
    if (__SCO.isString(__SCO.loc, "/basket")) {
        __sc.s = "1";
        processStatusOne();
    }
    else if (__SCO.isString(__SCO.loc, "/shop/checkout/confirmation2.aspx")) {
        __sc.s = "3";
    } 
}

function attach() {
    __SCO.onChange(__SCO.id('ctl00_deContent_ctl01_txtEmail'), "email");
    __SCO.onChange(__SCO.id('ctl00_deContent_ctl02_txtFirstName'), "name");
    __SCO.onChange(__SCO.id('ctl00_deContent_ctl02_txtLastName'), "surname");
    __SCO.onChange(__SCO.id('ctl00_deContent_ctl02_txtEmail'), "email");
    __SCO.onChange(__SCO.id('ctl00_deContent_txtEmail'), "email");
    __SCO.onChange(__SCO.id('ctl00_deContent_txtFirstName'), "name");
    __SCO.onChange(__SCO.id('ctl00_deContent_txtLastName'), "surname");
    __SCO.onChange(__SCO.id('ctl00_deContent_txtEmail'), "email");
    __SCO.onChange(__SCO.id('ctl00_FooterId_emailsingupform_8b2_EmailAddressTextbox'), "email");
    __SCO.onChange(__SCO.id('ctl00_deContent_ContactUsControl_Email'), "email");
    __SCO.onChange(__SCO.id('ctl00_deContent_ContactUsControl_Telephone'), "telephone");
    __SCO.onChange(__SCO.id('ctl00_deContent_ContactUsControl_Name'), "name");
    __SCO.onChange(__SCO.id("ctl00_Content_login_txtEmail"), "email");
    __SCO.onChange(__SCO.id("ctl00_Content_login_txtGuestEmail"), "email");
}

function processStatusOne() {
    var imgs = "", itemName = "", itemQty = "", itemPrice = "", totalPrice = "", itemIds = "", custom1 = "", custom2 = "", itemCount = 0, itemFields = "", sessionFields = "", minusPrice = 0;
    __SCO.remV.src = "http://|https://|www.myla.com|/includes/handlers/img.ashx?img=|&w=72&h=108";
    __SCO.remV.href = "http://|http://|www.myla.com|/product";
    if (__SCO.eclass("basket-items-summary","table") != "") {
        var table = __SCO.getDOM(__SCO.eclass("basket-items-summary", "table")[0], "1 basket");
        var rows = __SCO.getDOM(__SCO.tag("tr", __SCO.tag('tbody', table)[1]), "2 item rows");
         try { 
            for (var i = 1; i < rows.length; i++) {
                var imgsL = "", itemNameL = "", itemQtyL = "", itemPriceL = "", itemIdsL = "", custom1L = "", custom2L = "", itemFieldsL = "", ex1 = "", ex2 = "";
                if (__SCO.isString(rows[i].className, "item-")) {
                    imgsL = __SCO.remP(__SCO.getDOM(__SCO.tag("img", rows[i])[0], "4 image"), "src");
                    custom1L = __SCO.remP(__SCO.getDOM(__SCO.tag("a", rows[i])[0], "5 product link"), "href");
                    itemNameL = __SCO.text(__SCO.getDOM(__SCO.tag('a', rows[i])[1], "6 itemName"));
                    itemIdsL = __SCO.getDOM(__SCO.inBetween('/', '', custom1L, 'll'), "7 itemIds");
                    itemPriceL = __SCO.priceCurr(__SCO.text(__SCO.getDOM(__SCO.eclass('product-price-text', 'span', rows[i])[0], "8 itemPrice")));
                    itemQtyL = __SCO.getDOM(__SCO.text(__SCO.eclass("product-qty-text", "span", rows[i])[0]), "9 itemQty");
                    var options = __SCO.eclass('item-options', 'ul', rows[i]);
                    ex1 = options.length > 0 && __SCO.tag('li', options[0]).length > 0 ? __SCO.text(__SCO.getDOM(__SCO.tag('li', options[0])[0], "10 ex1")) : '';
                    ex2 = options.length > 0 && __SCO.tag('li', options[0]).length > 1 ? __SCO.text(__SCO.getDOM(__SCO.tag('li', options[0])[1], "11 ex2")) : '';
                    itemFieldsL = "ex1^" + ex1 + "~ex2^" + ex2;
                    minusPrice += itemQtyL == 0 ? itemPriceL * itemQtyL : 0;
                    custom2L = '[[NEW]]';
                    // Insert new row only if following conditions are met
                    if (itemNameL != "" && itemQtyL != "" && itemPriceL != "" && itemIdsL != "" && itemQtyL != 0 ) {
                        imgs += imgsL + "|";
                        itemName += itemNameL + "|";
                        itemQty += itemQtyL + "|";
                        itemPrice += itemPriceL + "|";
                        itemIds += itemIdsL + "|";
                        custom1 += custom1L + "|";
                        custom2 += custom2L + "|";
                        itemFields += itemFieldsL + "|";
                        itemCount++;
                    }
                }
            }            
        }
        catch (err) { 
            __SCO.error("101 " + err.description);
        }
        try {
            /*var trows = __SCO.getDOM(__SCO.tag('tr', __SCO.tag('tbody', __SCO.id('shopping-cart-totals-table'))[0]), "12 trows"), shipping = "", abT = "", discount = "";
            for(var a = 0; a < trows.length; a++) {
                var text = __SCO.tag('td', trows[a]).length > 1 ? __SCO.text(__SCO.tag('td', trows[a])[0]).toLowerCase() : '';
                totalPrice = text == "subtotal" ? __SCO.priceCurr(__SCO.text(__SCO.getDOM(__SCO.tag('td', trows[a])[1], "0 totalPrice"))) : totalPrice;
                shipping = text == "shipping amount" ? __SCO.priceCurr(__SCO.text(__SCO.getDOM(__SCO.tag('td', trows[a])[1], "13 shipping"))) : shipping;
                discount = text == "total discount" ? __SCO.priceCurr(__SCO.text(__SCO.getDOM(__SCO.tag('td', trows[a])[1], "14 discount"))) : discount;
            }
            abT = __SCO.priceCurr(__SCO.text(__SCO.getDOM(__SCO.eclass('price grandTotalFormatPrice', 'span', __SCO.id('shopping-cart-totals-table'))[0], "15 abT")));
            sessionFields = "shipping^" + shipping + "~discount^" + discount + "~abT^" + (__SCO.curSym == 'GBP' ? "%C2%A3 " + abT : __SCO.curSym == 'USD' ? '%24 ' + abT : abT + ' %E2%82%AC');*/
            var ship = 0;
            if(__SCO.id("ctl00_deContent_Shipping1_lblShippingValue")) {
                ship = __SCO.priceCurr(__SCO.text(__SCO.id("ctl00_deContent_Shipping1_lblShippingValue")));
            }
            var abt = totalPrice = __SCO.priceCurr(__SCO.text(__SCO.eclass("basket-subtotal-text", "span")[0]));
            sessionFields = 'abt^' + abt;
            totalPrice = (abt * 1) - ship;
        }
        catch (errOR) { 
            __SCO.error("201 " + errOR.description);
        }
    }
    // do not allow baskets with no total price
    if (itemCount == 0 || totalPrice == "" || totalPrice == 0 || totalPrice == "0.00") {
        __sc.er == "" ? __sc.s = '' : '';
    }
    else {
        __sc.u = imgs;
        __sc.i = itemName;
        __sc.q1 = itemQty;
        __sc.v1 = itemPrice;
        __sc.p = itemIds;
        __sc.cu1 = custom1;
        __sc.cu2 = custom2;
        __sc.ifs = itemFields;
        __sc.sfs = sessionFields;
        __sc.v2 = (totalPrice - minusPrice).toFixed(2);
        __sc.y = __SCO.curSym;
    }
}

/***** BYTESIZE GLOBAL *****/   
(function (window, undefined) {
    var __SCO = {
        curr: { 
            "K\u010d": "CZK",   // Czech Krone
            "\u20ac": "EUR",   // Euro
            "€":"EUR",           // Euro
            "\u00a3": "GBP",  // UK Pound
            "Rp":"IDR",           // Indonesia Rupiah
            "\u20b9":"INR",      // India Rupee
            "Rs":"INR",           // India Rupee
            "\u00a5": "JPY",    // Japanese Yen
            "RM":"MYR",         // Malaysia Ringgit
            "kr": "NOK",          // Norwegian/Swedish/Danish Krone
            "\u20b1":"PHP",      // Phillipines Peso
            "z\u0142": "PLN",   // Polish Zloty
            "\u0440\u0443\u0431":"RUB",  //Russian Ruble
            "py6":"RUB",        // Russian Ruble
            "py\u0431":"RUB", // Russian Ruble
            "SG$":"SGD",         // Singapore Dollar
            "\u0e3f":"THB",      // Thailand Baht
            "\u0e1a\u0e32\u0e17":"THB", // Thailand Baht
            "$": "USD",         // US/Australia/New Zealand/Canada Dollar
            "\u20ab":"VND"     // Viet Nam Dong
        },
        currS: "CZK|EUR|GBP|IDR|INR|JPY|MYR|NOK|PHP|PLN|RUB|SGD|THB|USD|VND|kr|z\u0142|K\u010d|$|\u00a3|\u20ac|\u00a5|€|SG$|Rs|\u20b9|Rp|\u20ab|RM|\u0e3f|py6|py\u0431|\u0440\u0443\u0431|\u20b1|\u0e1a\u0e32\u0e17",
        remV: { src: "", href: "" },
        mailBlock: "",
        loc: window.location.href.toString().toLowerCase(),
        siteLocalised: false,
        localeBrowser: false,
        optNeg: false,
        curSym: "",
        addA: function (z, y) { 
            y = y||z.length, x= ""; for(var i = 0; i < y; i++) { x+= z[i]; } return x;
        },
        addEvent: function (a) {
            if (navigator.appName == "Microsoft Internet Explorer") {
                var a = __SCO.tag("body")[0];
                if (a) {
                    var b = document.createElement("input");
                    b.setAttribute("type", "hidden");
                    b.onclick = function () {
                        __SCO.runByteSize();
                        return false;
                    }
                    a.appendChild(b);
                    b.click();
                }
            }
            else {
                window.addEventListener("load", __SCO.runByteSize, false);
            }
        },
        clean: function (a) {
            return (a != null) ? a.replace(/^\s*|\s*$/g, '').replace(/\s{2,2000}/g, " ") : ''
        },
        eclass: function (a, b, c, d) {
            if (a != "") {
                c = c || document,
                b = b || "*",
                d = d || 1,
                f = new Array(),
                e = this.tag(b, c);
                for (var i = 0; i < e.length; i++) {
                    if ((d == 1 && e[i].className == a) || (d == 2 && e[i].className.indexOf(a) != -1) || (d == 3 && (e[i].className.search(new RegExp("(^|\\s)" + a.replace(/\$/g, "\\$") + "(\\s|$)")) != -1))) {
                        f.push(e[i]);
                    }
                }
                return f[0] != 'undefined' ? f : ''
            }
        },
        error: function (a) {
            __sc.er = (__sc.er == "") ? a : __sc.er;
            return null
        },
        esc: function (a) {
            return a.replace(/[-[\]{}()*+?.,\\^$|#]/g, "\\$&").replace(/\s/g, "\\s")
        },
        getDOM: function (a, b) {
            b = b || "";
            if (a != null) {
                if (typeof (a.length) != "undefined") {
                    return (a.length > 0) ? a : this.error(b);
                }
                else {
                    return a;
                }
            }
            else {
                return (b != "") ? this.error(b) : null;
            }
        },
        getVT: function (a, b) {
            var b = b || "v";
            var c = a.tagName.toLowerCase();
            var d = a.type.toLowerCase();
            var e;
            if (c == "select") {
                e = (b == "v") ? a.options[a.selectedIndex].value : a.options[a.selectedIndex].text;
            }
            else if (c == "input") {
                if (d == "checkbox" || d == "radio") {
                    e = (a.selected || a.checked == true) ? "1" : "0";
                }
                else {
                    e = typeof a.value == "undefined" ? "" : a.value;
                }
            }
            return this.clean(e);
        },
        id: function (a, b) {
            return document.getElementById(a);
        },
        inBetween: function (a, b, c, d) {
            var d = d || "ff", e = '', f = 0, g = c.indexOf(a), h = c.lastIndexOf(a),
            i = a.length, j = "substring", k = c.lastIndexOf(b);
            if (g != -1 && k != -1) {
                if (a == b) {
                    f = c.match(new RegExp(this.esc(a), 'g'));
                    (d == "ff" && f.length > 1) ? e = c[j](g + i, c.indexOf(b, g + i)) : e;
                    (d == "fl" && f.length > 1) ? e = c[j](g + i, k) : e;
                }
                else {
                    (d == "ff") ? e = c[j](g + i, c.indexOf(b, g + i)) : e;
                    (d == "fl") ? e = c[j](g + i, k) : e;
                    (d == "lf") ? e = c[j](h + i, c.indexOf(b, h + i)) : e;
                    (d == "ll") ? e = c[j](h + i, k) : e;
                }
            }
            return __SCO.clean(e);
        },
        isString: function (a, b) {
            return (a.indexOf(b) == -1) ? false : true
        },
        isValid: function(a,b) {
            if(b == "email") {
                return __SCO.isString(a,"@") ? true : false;
            }
            else if(b == "telephone") {
                var a = a.replace(/[^0-9]/gi,""),c = a.split(new RegExp(a[0])).length-1;
                return (a.length > 5 && c != a.length) ? true : false;
            }
            else {
                return true;
            }
        },
        name: function (a) {
            return document.getElementsByName(a);
        },
        onChange: function (a, b, c, d) {
            var c = c || "";
            if (this.getDOM(a) != null) {
                var e = a.disabled || false;
                var v = __SCO.getVT(a, d);
                if (e == true) { a.disabled = false; }
                a.onchange = function () {
                    var v = __SCO.getVT(this, d);
                    if ((v != "" && v != c && __SCO.isValid(v,b) == true) || b == "optout") {
                        if (b == "name" || b == "surname" || b == "title") {
                            v = v.charAt(0).toUpperCase() + v.slice(1);
                            var n = (__sc.n != "") ? __sc.n.split("|") : (__sc.n = '||'.split("|"));
                            if (b == "name") { n[0] = v; } else if (b == "surname") { n[1] = v; } else { n[2] = v; }
                            __sc.n = n.join("|");
                        }
                        else {
                            __sc[b.substring(0, 1)] = (__SCO.optNeg == true && b == "optout") ? ((v - 1) * -1) : v;
                        }
                        if (b != "title") {
                            __sc.s = __sc.s != '' ? __sc.s : '2';
                            __scRun(__sc);
                        }
                    }
                }
                if (e == true) { a.disabled = true; }
                v != "" ? a.onchange() : null;
            }
        },
        priceCurr: function (a, f) {
            var f = f == false ? false : true;
            if(a.replace(/[^\d]/g, "") != "") {
	            b = a.match(new RegExp("(" + this.currS.replace(/\$/g, "\\$") + ")"),"i") || '',
	            c = a.replace(/[^\d\,\.]/g, "").match(/[\d]+/g),
	            d = (c.length == 1) ? c[0] : (c[c.length-1].length < 3) ? this.addA(c, c.length-1) + "." + c[c.length-1]: this.addA(c),
	            e = (b.length > 0) ? (typeof this.curr[b[0]] !== 'undefined') ? this.curr[b[0]] : b[0] : '';
	            this.curSym = e;
	            return (d != "") ? d : ((f == true) ? this.error("301 price not found") : "0.00");
            }
            else if (a == "" && f == true) {
                this.error("301 price not found");
            }
            else { return "0.00" }
        },
        remP: function (a, b) {
            return (a != null) ? a.getAttribute(b).replace(new RegExp("(" + this.remV[b].replace(/\?/g, "\\?").replace(/\&/g, "\\&").replace(/\./g, "\\.").replace(/\-/g, "\\-") + ")+", "g"), '') : ''
        },
        runByteSize: function () {
            try {
                populate();
                attach();
                (__sc.s != "" && __sc.s != 0) ? __scRun(__sc) : null;
            }
            catch (err) { }
        },
        setLocale: function (a) {
            __sc.ctd = (this.siteLocalised == true && this.localeBrowser == true) ? (navigator.language || navigator.userLanguage) : a;
        },
        tag: function (a, b) {
            return (b = b || document) ? b.getElementsByTagName(a) : '';
        },
        text: function (a) {
            return (a != null) ? this.clean(a.textContent || a.innerText) : ''
        },
        title: function () {
            return this.text(this.getDOM(this.tag("title")[0])) || this.loc
        }
    }
    window.__SCO = __SCO;

})(window);
__SCO.addEvent(sc_onload_ie);
/***** SALECYCLE GLOBAL *****/
var __sc;
function __runSC(t) {
    (t == true) ? __SCO.runByteSize() : __scRun(__sc);
}
function __scExt(t){
    __sc.cc = 0; (t == true) ? __sc.s = 4 : ''; __scRun(__sc);
}
function __scIsV(a) {
    return (__sc[a] == null || __sc[a] == "undefined") ? true : false
}
function __scRun(__sc) {
    var c = __scIsV("c") ? '' : __scCI(__sc.c);  //"c"lient id
    if (c != '') {
        var b = __scIsV("b") ? '' : __scCI(__sc.b),  //item session or "b"asket id
        s = __scIsV("s") ? '' : __scCI(__sc.s),  //cart "s"tatus - 1 = shopping, 2 = checkout, 3 = completed sale    
        n = __scIsV("n") ? '' : __scCI(encodeURI(__sc.n)),  //customer "n"ame
        e = __scIsV("e") ? '' : __scCI(__sc.e),  //customer "e"mail
        t = __scIsV("t") ? '' : __scCI(__sc.t),  //customer "t"elephone
        o = __scIsV("o") ? '' : __scCI(__sc.o),  //customer "o"pt out of receiving emails - we will assume opted in unless this flag is set to 1
        p = __scIsV("p") ? '' : __scCI(__sc.p),  //item "p"roduct ids or maybe hotel name
        i = __scIsV("i") ? '' : __scCI(encodeURI(__sc.i)),  //"i"tem name or maybe room type
        v1 = __scIsV("v1") ? '' : unescape(__scCI(__sc.v1)),  //item "v"alue1 item value of maybe room duration value - client trading currency
        v2 = __scIsV("v2") ? '' : unescape(__scCI(__sc.v2)), //item "v"alue2 (ideally total basket value or toal completed sales value) - client trading currency
        q1 = __scIsV("q1") ? '' : __scCI(__sc.q1), //item "q"uantity1 item quantity or maybe number of adults
        q2 = __scIsV("q2") ? '' : __scCI(__sc.q2), //item "q"uantity2 - maybe number of children
        q3 = __scIsV("q3") ? '' : __scCI(__sc.q3), //item "q"uantity3 - maybe number of rooms
        u = __scIsV("u") ? '' : __scCI(__sc.u), //item image "u"rl
        d1 = __scIsV("d1") ? '' : __scCI(__sc.d1), //item "d"ate1
        d2 = __scIsV("d2") ? '' : __scCI(__sc.d2), //item "d"ate2
        cu1 = __scIsV("cu1") ? '' : __scCI(__sc.cu1), //"c"ustom field1 - additional text entry data used for keyword lookup
        cu2 = __scIsV("cu2") ? '' : __scCI(__sc.cu2), //"c"ustom field2 - additional text entry data used for keyword lookup      
        w = __scIsV("w") ? __scCI(window.location.pathname) : __scCI(__sc.w), //"w"eb page name
        y = __scIsV("y") ? '' : __scCI(__sc.y), //Item Currency for all items in the basket  
        uc = __scIsV("uc") ? 0 : __scCI(__sc.uc), //"u"se "c"ookie for session id - some clients do not have session ids (0: use cookies but not for session; 1: use cookies also for sessions; 2: do not use any cookie
        cc = __scIsV("cc") ? 1 : __scCI(__sc.cc), //"c"laim "c"onversion
        st = __scIsV("st") ? 1800 : __scCI(__sc.st), //"s"ession expiry "t"ime in seconds
        ct = __scIsV("ct") ? 365 : __scCI(__sc.ct), //"c"ookie expiry "t"ime in days
        bs = __scIsV("bs") ? 0 : __scCI(__sc.bs), //byte size = 1 otherwise 0
        er = __scIsV("er") ? '' : __scCI(__sc.er), //"er"ror message
        ifs = __scIsV("ifs") ? '' : __scCI(__sc.ifs), //"i"tem "f"ield"s"
        sfs = __scIsV("sfs") ? '' : __scCI(__sc.sfs),//"s"ession "f"ield"s"
        ctd = __scIsV("ctd") ? '' : __scCI(__sc.ctd), // custom locale for dates
        scs = screen.availHeight+'-'+screen.availWidth+'-'+screen.colorDepth+'-'+screen.height+'-'+screen.width,
        //sale cycle "w"eb protocol
        sc_w = (document.location.protocol == 'https:') ? 'https://' : 'http://';

        //sale cycle web "a"ddress url
        sc_a = 'app.salecycle.com',

        //sale cycle web page "p"ath
        sc_p = (s == 3 || s == 5) ? '/import/pixelcapture.aspx' : '/import/capture.aspx',

        //sale cycle full "u"rl variable
        sc_u = sc_w + sc_a + sc_p;

        var sc_q = '';
        if (s == 3) {
            sc_q = 'c=' + c + '&b=' + b + '&cc=' + cc + '&ca=0&sfs=' + sfs + '&scs=' + scs;
        }
        else if (s == 5) {
            sc_q = 'c=' + c + '&e=' + e + '&cc=' + cc + '&sfs=' + sfs + '&scs=' + scs;
        }
        else {
            sc_q = unescape('fc=0&mid=0&c=' + c + '&b=' + b + '&n=' + n + '&e=' + e + '&t=' + t + '&o=' + o + '&p=' + p + '&i=' + i + '&u=' + u + '&v1=' + v1 + '&v2=' + v2 + '&q1=' + q1 + '&q2=' + q2 + '&q3=' + q3 + '&d1=' + d1 + '&d2=' + d2 + '&s=' + s + '&w=' + w + '&cu1=' + cu1 + '&cu2=' + cu2 + '&y=' + y + '&cc=' + cc + '&bs=' + bs + '&er=' + er + '&ca=0&st=' + st + '&ifs=' + ifs + '&sfs=' + sfs + '&ctd=' + ctd + '&scs=' + scs);
        }

        if (s == 3 || s == 5 || (navigator.appName != 'Microsoft Internet Explorer' && sc_q.length < 1900) || sc_q.length < 3500) {
            var sc_i = new Image();
            sc_i.src = sc_u + "?" + sc_q;
            sc_i.style.display = 'none';
        }
        else {
            //Random number - this is used for a new cookie's machine id and for qs chunk processing
            var len = 1900;
            (sc_q.length > 3500 && navigator.appName != 'Microsoft Internet Explorer') ? len = 3500 : len;
            var seed = (new Date()).getTime(); //Current Time of request
            var sc_rnd = seed + Math.floor(Math.random(seed) * 1000000000000);
            var sc_ch = __scGCL(sc_q, len);
            if (sc_ch > 0) {
                var sc_n = Math.floor(sc_q.length / sc_ch);
                if (sc_q.length % sc_ch != 0) sc_n++;
                for (var i = 0; i < sc_n; i++) {
                    var sc_i = new Image();
                    sc_i.src = sc_u + "?sc_dt=" + sc_rnd + "&sc_pn=" + (i + 1) + "_" + sc_n + "&" + sc_q.substr(i * sc_ch, sc_ch);
                    sc_i.style.display = 'none';
                }
            }
        }
    }
}
function __scCI(e) {
    return escape(e.toString().replace(/&/g, '[sc_amp]').replace(/\?/g, '[sc_qm]').replace(/\+/g, '[sc_pl]').replace(/>/g, '[sc_bc]').replace(/</g, '[sc_bo]'));
}
function __scGCL(q, l) {
    var bValid = true;
    var sc_n = Math.floor(q.length / l);
    if (q.length % l != 0) sc_n++;
    for (var i = 1; i < sc_n; i++) {
        if (q.charAt(l * i) == '=' || q.charAt(l * i) == '&' || q.charAt(l * i) == '/' || q.charAt(l * i - 1) == '=' || q.charAt(l * i - 1) == '&' || q.charAt(l * i - 1) == '/' || q.charAt(l * i - 2) == '=' || q.charAt(l * i - 2) == '&' || q.charAt(l * i - 2) == '/' || q.charAt(l * i - 3) == '=' || q.charAt(l * i - 3) == '&' || q.charAt(l * i - 3) == '/' || q.charAt(l * i - 4) == '=' || q.charAt(l * i - 4) == '&' || q.charAt(l * i - 4) == '/' || q.charAt(l * i + 1) == '=' || q.charAt(l * i + 1) == '&' || q.charAt(l * i + 1) == '/' || q.charAt(l * i + 2) == '=' || q.charAt(l * i + 2) == '&' || q.charAt(l * i + 2) == '/' || q.charAt(l * i + 3) == '=' || q.charAt(l * i + 3) == '&' || q.charAt(l * i + 3) == '/' || q.charAt(l * i + 4) == '=' || q.charAt(l * i + 4) == '&' || q.charAt(l * i + 4) == '/') {
            bValid = false;
            break
        }
    }
    if (!bValid) return __scGCL(q, (l - 5));
    return l
}