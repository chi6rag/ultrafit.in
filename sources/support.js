var fsmIsProductPage = /product/g.test(document.location.pathname);
var fsmIsCategoryPage = /category/g.test(document.location.pathname);
var fsmPriceMax;
var fsmPriceMin;
var fsmsliderInit =true;
var fsmSizes = [];

var FSM_currencies = {"GBP": "&pound;", "EUR": "&euro;", "USD": "&#36;"};

LM.preInit(function () {
	LM.Currency = LM.getCookie("CurrencyCode");
	
	//add custom fields
	jQuery('input[data-esp-var]').each(function(){
		if(jQuery(this).val().length>0){
			LM.addCustomField(jQuery(this).attr('data-esp-var'),jQuery(this).val());
		}
	});	
	
	if (LM.getCookie("FSM_view") == null) {
		LM.setCookie("FSM_view", "Mannequin", "S");
	}
	
	LM.config("FSM_view", LM.getCookie("FSM_view") || "Mannequin");
});

LM.multi_init(function () {
	if (fsmIsCategoryPage) {
		// Required
		LM.Multi_PriceField = "prices";
		LM.Multi_IsSearchPage = false;

		LM.Multi_FixedPriceFacet = !jQuery("#slider-price").length;
		LM.Multi_ScrollToTop = false;

		LM.multi_toggleFacetItem(function (obj) {
			// Example changing the class of the parent element
			if (jQuery(obj).attr("data-enabled") == "false") {
				jQuery(obj).parent().css("color","Gray");
			}
			else {
				jQuery(obj).parent().css("color","");
			}
			
			//enable size button if  corresponding size exists in the facet options
			/*jQuery('li.size_buttons a').each(function(){	
				var sbutton = jQuery(this);	
				sbutton.css({'pointer-events':'none !important','cursor':'default','background':'#ccc'});
				sbutton.attr('disabled','disabled');
				var buttonVal = jQuery(this).text().toUpperCase();
				jQuery.each(fsmSizes,function(i,values){
					if(jQuery('#'+values.ID).attr('data-enabled') == "true"){
						if(values.DataVal===buttonVal){
							sbutton.removeAttr('disabled');
							sbutton.removeAttr('style');
						}
					}
				});
			});*/
		});


		LM.multi_resetPriceSlider(function () {
			var minVal = jQuery("#fsmOrigPriceMin").val();
			var maxVal = jQuery("#fsmOrigPriceMax").val();
			jQuery("#slider-price").slider("option", "values", [parseInt(minVal), parseInt(maxVal)]);
		});
		
		LM.multi_setPriceSlider(function (min, max) {
			jQuery("#slider-price").slider("option", "values", [min, max]);
		});
		
		if(fsmsliderInit){
			fsmPriceMax = jQuery("#fsmOrigPriceMax").val();
			fsmPriceMin = jQuery("#fsmOrigPriceMin").val();
		
			var minVal = parseInt(jQuery("#fsmOrigPriceMin").val());
			var maxVal = parseInt(jQuery("#fsmOrigPriceMax").val());
			jQuery("#slider-price").slider({
				range: true,
				min: minVal,
				max: maxVal,
				values: [minVal, maxVal],
				slide: function (event, ui) {
					// Update price display
					//alert(ui.values[ 0 ]+":"+ui.values[ 1 ]);
					//jQuery( "#fsmStartPriceLabel" ).val( ui.values[ 0 ]);
					//jQuery( "#fsmEndPriceLabel" ).val( ui.values[ 1 ]);
					jQuery("span.startPrice").html(FSM_addCurrencySymbol(ui.values[0]));
					jQuery("span.endPrice").html(FSM_addCurrencySymbol(ui.values[1]));
				},
				change: function (event, ui) {
					if (event.originalEvent) {
						LM.Multi_PriceSliderChange(ui.values[0], ui.values[1]);
					}
				}
			});
			fsmsliderInit=false;
		}
		
	}
	
	
	
	//get all sizes options and place in array
jQuery('input[data-field="ESP_Rational_Size"]').each(function(){
	switch(jQuery(this).attr('data-value')){
		case "Extra Small":
			fsmSizes.push({/*ID:jQuery(this).attr('id'),*/Val:jQuery(this).attr('data-value'),DataVal:"XS"})
		break;
		case "Small":
			fsmSizes.push({/*ID:jQuery(this).attr('id'),*/Val:jQuery(this).attr('data-value'),DataVal:"S"})
		break;
		case "Medium":
			fsmSizes.push({/*ID:jQuery(this).attr('id'),*/Val:jQuery(this).attr('data-value'),DataVal:"M"})
		break;
		case "Large":
			fsmSizes.push({/*ID:jQuery(this).attr('id'),*/Val:jQuery(this).attr('data-value'),DataVal:"L"})
		break;
		case "Extra Large":
			fsmSizes.push({/*ID:jQuery(this).attr('id'),*/Val:jQuery(this).attr('data-value'),DataVal:"XL"})
		break;
		default:
		fsmSizes.push({/*ID:jQuery(this).attr('id'),*/Val:jQuery(this).attr('data-value'),DataVal:jQuery(this).attr('data-value').substring(2)})
	}
	
	//hide all unchecked size facet options to begin with
		//jQuery('input[data-field="ESP_Rational_Size"]').each(function(){
		if(jQuery(this).attr('checked')){		
			jQuery(this).parent().show();	
		}
		else{
			jQuery(this).parent().hide();	
		}
		//});

});
	
});

LM.complete(function () {
if(!jQuery("dl#narrow-by-list dt").hasClass("fsm_setup")){
	jQuery("dl#narrow-by-list dt").click(function() {
		jQuery(this).next('dd').slideToggle('fast');
		jQuery(this).find('span').toggleClass('active');
		return false;
	});
	jQuery("dl#narrow-by-list dt").click();
	jQuery("dl#narrow-by-list dt").addClass("fsm_setup");
}

	jQuery('.product-image').each(function(){
			var lstimg = jQuery(this).children().last();
			var frtimg = jQuery(this).children().first();
			var count = jQuery(this).children().length;
			
			if(count>1){
				jQuery(this)
				.mouseover(function(){
					lstimg.css('display','block');
					frtimg.css('display','none');
				})
				.mouseout(function(){
					lstimg.css('display','none');
					frtimg.css('display','block');
				})
			}
	});
	
		//enable size button if  corresponding size exists in the facet options
		jQuery('li.size_buttons a').each(function(){	
			var sbutton = jQuery(this);	
			sbutton.css({'pointer-events':'none !important','cursor':'default','background':'#ccc'});
			sbutton.attr('disabled','disabled');
			var buttonVal = jQuery(this).text().toUpperCase();
			jQuery.each(fsmSizes,function(i,values){
				if(jQuery('[data-value="' + values.Val + '"]:first').attr('data-enabled') == "true"){
					if(values.DataVal===buttonVal){
						sbutton.removeAttr('disabled');
						sbutton.removeAttr('style');
					}
				}
			});
		});

//click function of size buttons
	jQuery('li.size_buttons a').unbind("click").click(function(e){
	if (jQuery(this).attr("disabled")) {
		return false;
	}
	jQuery(this).toggleClass('on');	
	var selectedsize=jQuery(this).text().toUpperCase();
		if(jQuery(this).hasClass("on")){
			 showSizes(selectedsize);
		}
		else{
			removeSizeFilters(selectedsize);
			hideSizes(selectedsize);
		}
	e.stopPropagation();
	return false;
});


	if (fsmIsCategoryPage) {
		if (document.getElementById("priceValue") != null) {
			var priceString = document.getElementById("priceValue").innerHTML;
			var prices = new Array()
			prices = priceString.split(" - ");
			var newPriceString = ""; 
			for (var i = 0; i < prices.length; i++){
				switch (LM.Currency) {	
					case "GBP": 
						prices[i] = "&pound;"+prices[i];
						break;	
					case "USD": 
						prices[i] = "&#36;"+prices[i];
						break;	
					case "EUR": 
						prices[i] = prices[i]+" &euro;";
						prices[i] = prices[i].replace(".","*");
						prices[i] = prices[i].replace(",",".");
						prices[i] = prices[i].replace("*",",");
						break;
					default: 
						prices[i] = "&pound;"+prices[i];
						break;
				}

				if (i != 0){
					newPriceString += " - ";
				}
				newPriceString += prices[i];
			}
			document.getElementById("priceValue").innerHTML = newPriceString;
		}
		
		path = document.getElementById("clearurl").getAttribute("href");

		var queryString = location.search;
		startOfSort = queryString.indexOf("esp_sort=");
		if (startOfSort != -1) {
			var sortVarriables = queryString.slice(startOfSort,queryString.indexOf("&",startOfSort));
			startOfOrder = queryString.indexOf("esp_order=");
			sortVarriables += "&"+ queryString.slice(startOfOrder,queryString.indexOf("&",startOfOrder));
			if (path .indexOf("?") == -1) {
				path = path + "?" + sortVarriables;
			} 
			else {
				path = path + "&" + sortVarriables;
			}
		}
		
		document.getElementById("clearurl").setAttribute("href",path);	
	}

	if (fsmIsProductPage) {
		jQuery("input.btn_add_to_bag").first().click(function() {
			var qty = jQuery("select.currentQty").first().val();
			var size = jQuery("select.currrentSize").first().val();
			var sku = jQuery("#ctl00_deContent_productDetailInfoControl_mainProductId").val();
			if (sku != "" && size != "Select Size" && qty != "Qty") {
				LM.addBasketItemCookie({ sku: sku, qty: qty });
			}
		});
	}
	
	
});


function showSizes(sSize){
	jQuery.each(fsmSizes, function(i,values){
		if(values.DataVal===sSize){
			jQuery("input[data-value='"+values.Val+"']").parent().fadeIn('fast');
		}
	})
}

function hideSizes(sSize){
	jQuery.each(fsmSizes, function(i,values){
		if(values.DataVal===sSize){
			if(!jQuery("input[data-value='"+values.Val+"']").attr('checked')){
				jQuery("input[data-value='"+values.Val+"']").parent().fadeOut('fast');
			}
		}
	})
}

function removeSizeFilters(sSize) {
	var hasValue = false;
	jQuery.each(fsmSizes, function(i,values) {
		if (values.DataVal == sSize) {
			var obj = jQuery("input[data-value=\"" + values.Val + "\"]");
			if (obj && obj.attr("checked")) {
				obj.removeAttr("checked").attr("data-checked", "false");
				if (!hasValue) {
					hasValue = true;
				}
			}
		}
	});
	if (hasValue) {
		LM.Multi_CurrentField = "ESP_Rational_Size";
		LM.Multi_SetFilters();
	}
}

function FSM_swapImage(obj) {
	try {
		var view = LM.getCookie("FSM_view") || LM.config["FSM_view"];
		if (view == "Mannequin" || view == "Model") {
			jQuery("a.product-image").each(function () {
				if (jQuery("img",this).length == 2) {
					jQuery("img", this).each(function (idx) {
						jQuery(this).attr("src", view == "Mannequin" ? jQuery(this).attr("data-model-url") : view == "Model" ? jQuery(this).attr("data-mannequin-url") : jQuery(this).attr("src"));
					});
				}
			});
			var newView = view == "Mannequin" ? "Model" : view == "Model" ? "Mannequin" : "";
			LM.setCookie("FSM_view", newView, "S");
			LM.config("FSM_view", newView);
			jQuery("span:first", obj).html(jQuery("span:first", obj).html().replace(newView, view));
			jQuery(obj).attr("title", jQuery(obj).attr("title").replace(newView, view));
		}
	}
	catch (e) {
	}
}

function FSM_addCurrencySymbol (price) {
	var currency = LM.Currency;
	var currsym = FSM_currencies[currency] || "&pound;";
	return (currency != "EUR" ? currsym : "") + price + (currency == "EUR" ? "&euro;" : "");
}