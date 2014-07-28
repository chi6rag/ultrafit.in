var showModal = function (selector) {
    jQuery(selector).click();
};

jQuery(document).ready(function () {
    jQuery('.cart .panel li').click(function (e) {
        e.stopPropagation();
    });
    jQuery('.cart .panel li a').click(function (e) {
        if (jQuery(this).siblings('.sub-panel').length > 0) {
            e.preventDefault();
            e.stopPropagation();
        }

        jQuery('.cart .panel li').removeClass('display-panel');
        jQuery(this).parent().addClass('display-panel');
    });

    jQuery('body').click(function () {
        jQuery('.cart .panel li').removeClass('display-panel');
    });

    jQuery('input.default, textarea.default')
        .focus(function () {
            if (this.value == this.title) {
                this.value = '';
            }
        })
        .blur(function () {
            if (this.value == '') {
                this.value = this.title;
            }
        });


    var $productStockInfo = jQuery('.p_list_stock');

    $productStockInfo.find('em').each(function () {
        var $this = jQuery(this);
        if ($this.attr('inStock') != 'True') {
            var $stockImg = $this.parent().find('img');
            var newImgUrl = $stockImg.attr('src').replace('ico_right.gif', 'ico_erro.gif');
            $stockImg.attr('src', newImgUrl);
        }
    });

    $productStockInfo.find('span').each(function () {
        var $this = jQuery(this);
        if ($this.text() == '') {
            $this.remove();
        }
    });

    var printPage = function () {
        window.print();
    };

    jQuery('.btn_print').click(function (e) {
        e.preventDefault();
        printPage();
    });

    jQuery(".search-submit").click(function (e) {
        var fieldval = jQuery.trim(jQuery(".search-field").val());

        if (fieldval.length == 0 || fieldval == "Product Search") {
            alert('Please enter a valid search term');
        } else {
            var url = "http://lingerie.myla.com/search?p=Q&asug=&w=" + escape(fieldval);
            location.href = url;
        }

        e.preventDefault();
    });

    jQuery(".search-field").keypress(function (e) {
        if (e.which == 13) {
            e.preventDefault();
            this.blur();
            jQuery(".search-submit").click();
        }
    });

    jQuery(".footer-subscribe .input-text").keypress(function (e) {
        if (e.which == 13) {
            e.preventDefault();
            this.blur();
            jQuery(".footer-subscribe .button").click();
        }
    });
   
});