// Initialise namespace + container vars
var LM = new Object();
LM.Version = "2.14.3";
LM.Utils = function() {}; //For us to add util functions to (DOM manipulation etc)
LM.Initialised = false;
LM.SiteId = "1d12d75f-dfc3-49f4-b84c-d941bcf20846";
LM.Domain = "http://esp.locayta.com";
LM.QueryPrefix = "esp_";
LM.SiteReferrer = "";
LM.UID = null;
LM.SID = null;
LM.Culture = null;
LM.Currency = null;
LM.Language = null;
LM.Sku = null;
LM.Category = null;
LM.TrackingCode = null;
LM.SearchTerm = null;
LM.RequestTime = null;
LM.FirstResponseTime = null;
LM.ResponseCompleteTime	= null;
LM.ServerTime = null;
LM.ServerRef = null;
LM.EventTime = new Date();
LM.Zones = [];
LM.BasketItems = [];
LM.OrderHeader = {};
LM.OrderItems = [];
LM.Config = {};
LM.OnComplete = null;  // deprecated
LM.OnPreInit = null;  // deprecated
LM._preInit = [];
LM._load = [];
LM._syncFacets = [];
LM._complete = [];
LM._trackComplete = [];
LM.AK = null;
LM.CurrentHash = null;
LM.FacetMode = "html";
LM.MergeHash = false;
LM.SearchOperator = null;
LM.ReloadWithFilters = false;
LM.FixedFacets = {};
LM.MergeDuplicateConfig = "false";
LM.ConfigJoinSeparator = ",";
LM.DataRequestReady = false;
LM.OverlayCaching = null;
LM.LazyLoadZone = null;
LM.LazyLoadPage = null;
LM.LazyLoadHits = null;

//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
// Allow custom event handlers
//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
LM.preInit = function(fn) {
	LM._preInit.push(fn);
}
LM.load = function(fn) {
	LM._load.push(fn);
}
LM.syncFacets = function(fn) {
	LM._syncFacets.push(fn);
}
LM.complete = function(fn) {
	LM._complete.push(fn);
}
LM.config = function(name, value) {
	if (LM.MergeDuplicateConfig == "true" && LM.Config[name]) {
		LM.Config[name] = LM.Config[name] + LM.ConfigJoinSeparator + value;
	}
	else {
		LM.Config[name] = value;
	}
}
LM.trackComplete = function (fn) {
    LM._trackComplete.push(fn);
}

//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
// Initialise .... calls when DOM has loaded
//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
LM.init = function (__lm_event_method) {
    if (LM.Initialised) return;
    LM.Initialised = true;

    // get click source
    LM.TrackingCode = LM.getCookie("LMTRACK");
    if (LM.TrackingCode != null && LM.TrackingCode != "") {
        LM.setCookie("LMTRACK", "", "S");
    }
    // get add to basket cookie
    var basketCookie = LM.getCookie("LMBASKET");
    if (basketCookie != null) {
        LM.addBasketItem({ sku: basketCookie.split(":")[0], qty: basketCookie.split(":")[1]});
        LM.removeCookie("LMBASKET");
    }

    // run any custom scripts
    for (var ii = 0; ii < LM._preInit.length; ii++) {
        try {
            if (typeof (LM._preInit[ii]) === "function") LM._preInit[ii]();
        }
        catch (e) { }
    }
    try {
        if (LM.OnPreInit != null) LM.OnPreInit(); // legacy
    }
	catch (e) { }

    // Tracking
    LM.UID = LM.syncCookie("LMUID", "P");
    LM.SID = LM.syncCookie("LMSID", "S");

	// add visit to user data
    var userData = LM.GetUserStorageData();
    if (userData != null) {
    	try {
    		if (!userData.hasOwnProperty("FSM_SID") || userData["FSM_SID"] != LM.SID) {
    			userData["FSM_SID"] = LM.SID;
    			userData["FSM_ReturnUser"] = 0;
    			if (userData.hasOwnProperty("FSM_CurrentVisit")) {
    				userData["FSM_LastVisit"] = userData["FSM_CurrentVisit"];
    				userData["FSM_ReturnUser"] = 1;
    			}
    			var date = new Date();
    			userData["FSM_CurrentVisit"] = (date.getDate() < 10 ? "0" : "") + date.getDate() + "/" + (date.getMonth() < 9 ? "0" : "") + (date.getMonth() + 1) + "/" + date.getFullYear();
    			userData["FSM_VisitCount"] = parseInt(userData["FSM_VisitCount"] || 0) + 1;
    		}

    		LM.SetUserStorageData(userData);
    	}
    	catch (ex) { }
    }

	// Do we need to re-apply the hash variables once the page has loaded?
    var hash = LM.getHashFromWindowLocation();
    if (hash.indexOf(LM.QueryPrefix) != -1) LM.ReloadWithFilters = true;
    LM.CurrentHash = hash;

    // If referrer is not current site keep track of referrer
    if (document.referrer) {
        var referrerHost = document.referrer.replace("http://", "").replace("https://", "");
        if (referrerHost.indexOf("/") != -1) referrerHost = referrerHost.substring(0, referrerHost.indexOf("/"));
        if (referrerHost != window.location.hostname) {
            LM.setCookie("LMSITEREFERRER", document.referrer, "S");
        }
    }
    LM.SiteReferrer = LM.getCookie("LMSITEREFERRER") || "";

    // overlay
    LM.AK = null;
    var lmaidCk = LM.getCookie("LMAID");
    var lmkeyIdx = location.search.indexOf("_lmkey=");
    if (lmkeyIdx != -1) {
    	LM.AK = location.search.substring(lmkeyIdx + 7, lmkeyIdx + 43);
    }
    else if (lmaidCk != null && lmaidCk != "") {
        LM.AK = lmaidCk;
    }
    if (LM.AK != null) {
        LM.setCookie("LMAID", LM.AK, "S");
    }
    LM.getData();
}

//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
// The request to get data for each zone is packaged into a single
// call.
//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
LM.getData = function (args) {
    if (!LM.Initialised) return;
    var args = args || {};

    // run any custom scripts
    for (var ii = 0; ii < LM._load.length; ii++) {
        try {
            if (typeof (LM._load[ii]) === "function") LM._load[ii]();
        }
        catch (e) { }
    }
    LM.Zones = [];
    // Gather all the information we can from zones
    // and build into query string
    var divs = document.body.getElementsByTagName("div");
    for (var ii = 0; ii < divs.length; ii++) {
        var div = divs[ii];
        var divAttr = div.attributes["lmzone"] || div.attributes["locayta:lmzone"];
        if (divAttr) {
            div.locayta_lmstart = new Date(); // add date so we can monitor performance
            var __lm_meta = { "zone": divAttr.value, "element": div };
            var __add_zone = true;
            if (args["zones"]) { // additional (optional) check, if zones are specified in args then don't ignore other zones
            	try {
            		__add_zone = false;
            		var __zones = args["zones"];
            		for (var jj = 0; jj < __zones.length; jj++) {
            			if (divAttr.value == __zones[jj]["id"]) __add_zone = true;
            		}
            	}
            	catch (e) { }
            }
            if (__add_zone) LM.Zones.push(__lm_meta);
        }
    }

    var espQuery = LM.buildESPQuery();

    // Data request is now ready, so set ready flag
    LM.DataRequestReady = true;

    // Now we have all the details to send to the server
    // create script tag and append to header to initiate call
    LM.RequestTime = new Date();
    var headTag = document.getElementsByTagName("head")[0];
    var espScript = document.createElement("script");
    espScript.type = "text/javascript";

    espScript.src = LM.Domain + "/zones-js.aspx" + espQuery;
    headTag.appendChild(espScript);
};

//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
// The request to send tracking data
//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
LM.sendTracking = function (trackingType, params, srcObj) {
    if (!LM.Initialised) return;
    var espQuery = "?version=" + LM.Version + "&siteId=" + LM.SiteId + "&UID=" + LM.UID + "&SID=" + LM.SID + "&pageurl=" + encodeURIComponent(window.location.href) + "&trackingType=" + trackingType;
    // click tracking
    if (typeof srcObj !== undefined && srcObj != null) {
        LM.TrackingCode = null;
        if (srcObj.getAttribute && srcObj.getAttribute("data-esp-click")) {
            LM.TrackingCode = srcObj.getAttribute("data-esp-click");
            LM.setCookie("LMTRACK", LM.TrackingCode, "S");
        }
        else {
            var parent = srcObj.parentNode;
            while (parent) {
                var espTrackingCode = parent.getAttribute ? parent.getAttribute("data-esp-click") : null;
                if (espTrackingCode != null && espTrackingCode != "") {
                    LM.TrackingCode = espTrackingCode;
                    LM.setCookie("LMTRACK", espTrackingCode, "S");
                    parent = null;
                }
                else {
                    parent = parent.parentNode;
                }
            }
        }
    }
    if (LM.TrackingCode != null && LM.TrackingCode != "") {
        espQuery += "&tracking=" + LM.TrackingCode;
    }
    // Track view
    if (trackingType == 1) {
        if (LM.Sku != null) espQuery += "&sku=" + encodeURIComponent(LM.Sku);
    }
    // Track add to basket
    else if (trackingType == 2) {
        for (var espKey in params) {
            espQuery += "&basketitem_0_" + espKey.toLowerCase() + "=" + encodeURIComponent(params[espKey]);
        }
    }
    // Track purchase
    else if (trackingType == 3) {
        for (var espKey in params) {
            espQuery += "&orderitem_0_" + espKey.toLowerCase() + "=" + encodeURIComponent(params[espKey]);
        }
        LM.UpdateUserPurchaseData([params]);
    }
	// Overlay
	if (LM.AK != null) {
		espQuery += "&overlay=true";
	}

    // Now we have all the details to send to the server
    // create script tag and append to header to initiate call
    LM.RequestTime = new Date();
    var headTag = document.getElementsByTagName("head")[0];
    var espScript = document.createElement("script");
    espScript.type = "text/javascript";

    espScript.src = LM.Domain + "/tracking-js.aspx" + espQuery;
    headTag.appendChild(espScript);
}

//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
// Builds formatted server query string to send back to ESP engine
//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
LM.buildESPQuery = function() {
	// Build all params as query
	var pageUrl = window.location.href;
	if (LM.LazyLoadZone != null && LM.LazyLoadPage != null) {
		LM.MergeHash = true;
		var hash = LM.getHashFromWindowLocation();
		pageUrl = pageUrl.replace(hash, "");
		if (LM.LazyLoadHits != null) {
			hash = LM.getHash([LM.QueryPrefix + "hitsperpage", LM.QueryPrefix + "viewall", LM.QueryPrefix + "pg", LM.QueryPrefix + "page"]);
			if (hash != "") hash += "&";
			hash += LM.QueryPrefix + "pg=" + LM.LazyLoadPage + "&" + LM.QueryPrefix + "hitsperpage=" + LM.LazyLoadHits;
		}
		else {
			hash = LM.getHash([LM.QueryPrefix + "pg", LM.QueryPrefix + "page"]);
			if (hash != "") hash += "&";
			hash += LM.QueryPrefix + "pg=" + LM.LazyLoadPage;
		}
		pageUrl = pageUrl + "#" + hash;
	}
	var espQuery = "?version=" + LM.Version + "&siteId=" + LM.SiteId + "&UID=" + LM.UID + "&SID=" + LM.SID + "&referrer=" + encodeURIComponent(document.referrer) + "&sitereferrer=" + encodeURIComponent(LM.SiteReferrer) + "&pageurl=" + encodeURIComponent(pageUrl);
	for (var ii = 0; ii < LM.Zones.length; ii++) {
		espQuery += "&zone" + ii + "=" + encodeURIComponent(LM.Zones[ii]["zone"]);
	}
	// click tracking
	if (LM.TrackingCode != null && LM.TrackingCode != "") {
		espQuery += "&tracking=" + LM.TrackingCode;
	}
	// Facet mode
	espQuery += "&facetmode=" + LM.FacetMode + "&mergehash=" + LM.MergeHash;
	// Search term
	if (LM.SearchTerm != null) espQuery += "&searchterm=" + encodeURIComponent(LM.SearchTerm);
	// Preserve search operator
	if (LM.SearchOperator != null) espQuery += "&searchoperator=" + encodeURIComponent(LM.SearchOperator);
	// Culture
	if (LM.Culture != null) espQuery += "&culture=" + encodeURIComponent(LM.Culture);
	// Currency
	if (LM.Currency != null) espQuery += "&currency=" + encodeURIComponent(LM.Currency);
	// Language
	if (LM.Language != null) espQuery += "&language=" + encodeURIComponent(LM.Language);
	// Sku
	if (LM.Sku != null) espQuery += "&sku=" + encodeURIComponent(LM.Sku);
	// Category
	if (LM.Category != null) espQuery += "&category=" + encodeURIComponent(LM.Category);
	// Track add to basket
	for (var ii = 0; ii < LM.BasketItems.length; ii++) {
		for (var espKey in LM.BasketItems[ii]) {
			espQuery += "&basketitem_" + ii + "_" + espKey.toLowerCase() + "=" + encodeURIComponent(LM.BasketItems[ii][espKey]);
		}
	}
	// Track order header
	for (var espKey in LM.OrderHeader) {
		espQuery += "&orderheader_" + espKey.toLowerCase() + "=" + encodeURIComponent(LM.OrderHeader[espKey]);
	}
	// Track purchases
	if (LM.OrderItems.length > 0) {
		for (var ii = 0; ii < LM.OrderItems.length; ii++) {
			for (var espKey in LM.OrderItems[ii]) {
				espQuery += "&orderitem_" + ii + "_" + espKey.toLowerCase() + "=" + encodeURIComponent(LM.OrderItems[ii][espKey]);
			}
		}
		LM.UpdateUserPurchaseData(LM.OrderItems);
	}
	// Custom vars
	if (LM.Config != null) {
		for (var espKey in LM.Config) {
			espQuery += "&config_" + espKey.toLowerCase() + "=" + encodeURIComponent(LM.Config[espKey]);
		}
	}
	var userData = LM.GetUserStorageData();
	if (userData != null) {
		try {
			for (var data in userData) {
				if (userData[data] instanceof Array) {
					espQuery += "&config_" + data.toLowerCase() + "=" + encodeURIComponent(userData[data].join());
				}
				else {
					espQuery += "&config_" + data.toLowerCase() + "=" + encodeURIComponent(userData[data]);
				}
			}
		}
		catch (ex) { }
	}
	// Overlay
	if (LM.AK != null) {
		espQuery += "&overlay=true&aid=" + LM.AK;
		var overlayCaching = LM.getCookie("LMTOOLKITCACHING");
		if (overlayCaching != null) {
			espQuery += "&caching=" + overlayCaching;
		}
	}
	// Fixed facets/overrides
	for (var fixed in LM.FixedFacets) {
		espQuery += "&bucket_" + fixed + "=" + LM.FixedFacets[fixed];
	}
	return espQuery;
};

//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
// Allows a facet bucket to be manually overwritten
//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
LM.registerFixedFacet = function(facetName, facetValues) {
	var vals = [];
	for (var ii = 0; ii < facetValues.length; ii++) {
		vals.push(facetValues[ii].join(":"));
	}
	LM.FixedFacets[facetName] = vals.join(":");
}

//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
// Gets the hash key, but with specified params removed
//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
LM.getHash = function(stripKeys) {
	//var hash = window.location.hash.replace(/^#/, "");
    var hash = LM.getHashFromWindowLocation();
    var keyValues = hash.substring(1).split("&");
	hash = "";
	for (var ii = 0; ii < keyValues.length; ii++) {
		var keyValue = keyValues[ii];
		if (keyValue != "") {
			var remove = false;
			if (!remove && stripKeys != null && stripKeys.length > 0) {
				for (var jj = 0; jj < stripKeys.length; jj++) {
					if (stripKeys[jj] != "" && keyValue.indexOf(stripKeys[jj]) == 0) {
						remove = true;
					}
				}
			}
			if (!remove) {
				if (hash != "") hash += "&";
				if (!remove) hash += keyValue;
			}
		}
	}
	return hash;
}

//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
// gets the hash key values
//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
LM.getHashKeyValues = function () {
    //var hash = window.location.hash.replace(/^#/, "");
    var hash = LM.getHashFromWindowLocation();
    var keyValues = hash.substring(1).split("&");

    return keyValues;
}

LM.getHashFromWindowLocation = function () {
    var hash = "";
    var hashPos = window.location.href.indexOf("#");
    if (hashPos != -1) {
    	hash = window.location.href.substring(hashPos).replace(/%27/g, "'");
    }

    return hash;
}

//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
// Sets filters
//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
LM.setFilters = function (filters, currentField) {
    LM.FacetMode = "data";
    LM.MergeHash = true;
    var hash = LM.getHash([LM.QueryPrefix + "filter_", LM.QueryPrefix + "cf", LM.QueryPrefix + "pg", LM.QueryPrefix + "page"]);
    if (currentField != null && currentField != "") {
        if (hash != "") hash += "&";
        hash += LM.QueryPrefix + "cf=" + encodeURIComponent(currentField);
    }
    for (var field in filters) {
        var values = filters[field];
        for (var ii = 0; ii < values.length; ii++) {
            if (hash != "") hash += "&";
            hash += LM.QueryPrefix + "filter_" + encodeURIComponent(field) + "=" + encodeURIComponent(values[ii]);
        }
    }
    LM.CurrentHash = "#" + hash;
    window.location.hash = hash;
    LM.getData();
}

//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
// Clear filters
//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
LM.clearFilters = function () {
    LM.FacetMode = "data";
    LM.MergeHash = true;
    var hash = "";
    LM.CurrentHash = "#";
    window.location.hash = hash;
    LM.getData();
}

//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
// Set sort field and sort order
//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
LM.setSortField = function(sortField, sortOrder) {
	LM.FacetMode = "data";
	LM.MergeHash = true;
	var hash = LM.getHash([LM.QueryPrefix + "sort", LM.QueryPrefix + "order", LM.QueryPrefix + "pg", LM.QueryPrefix + "page"]);
	if (hash != "") hash += "&";
	hash += LM.QueryPrefix + "sort=" + encodeURIComponent(sortField);
	hash += "&" + LM.QueryPrefix + "order=" + encodeURIComponent(sortOrder);
	LM.CurrentHash = "#" + hash;
	window.location.hash = hash;
	LM.getData();
}

//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
// Set the page
//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
LM.setPage = function(page) {
	LM.FacetMode = "data";
	LM.MergeHash = true;
	var hash = LM.getHash([LM.QueryPrefix + "pg", LM.QueryPrefix + "page"]);
	if (hash != "") hash += "&";
	hash += LM.QueryPrefix + "pg=" + page;
	LM.CurrentHash = "#" + hash;
	window.location.hash = hash;
	LM.getData();
}

//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
// Set the hits per page
//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
LM.setPageView = function (hits) {
    LM.FacetMode = "data";
    LM.MergeHash = true;
    var hash = LM.getHash([LM.QueryPrefix + "hitsperpage", LM.QueryPrefix + "viewall", LM.QueryPrefix + "pg", LM.QueryPrefix + "page"]);
    if (hash != "") hash += "&";
    if (hits == "viewall") {
        hash += LM.QueryPrefix + "viewall=y";
    }
    else {
        hash += LM.QueryPrefix + "hitsperpage=" + hits;
    }
    LM.CurrentHash = "#" + hash;
    window.location.hash = hash;
    LM.getData();
}

//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
// Lazy load products
//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
LM.lazyLoad = function (args) {
	if (args.zone === undefined || args.zone == null) {
		if (args.src) {
			var parent = args.src.parentNode;
			while (parent) {
				args.zone = parent.getAttribute ? parent.getAttribute("lmzone") : null;
				if (args.zone != null) {
					parent = null;
				}
				else {
					parent = parent.parentNode;
				}
			}
		}
	}
	if (args.zone && args.zone != null) {
		LM.LazyLoadZone = args.zone;
		LM.LazyLoadPage = args.page || 2;
		if (args.hits && args.hits != null && args.hits != "") {
			LM.LazyLoadHits = args.hits;
		}
		LM.getData({ zones: [{ id: args.zone }] });
	}
}

//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
// Set/get cookie value
//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
LM.syncCookie = function(cookieName, cookieType) {
	var cookieValue = LM.getCookie(cookieName);
	if (cookieValue == null || cookieValue == "") cookieValue = LM.GUID();
	LM.setCookie(cookieName, cookieValue, cookieType);	
	return cookieValue;
}
LM.getCookie = function(cookieName) {
	var match = document.cookie.match ("(^|;) ?" + cookieName + "=([^;]*)(;|$)");
	if (match) {
		return (unescape(match[2]));
	}
	else {
		return null;
	}
}
LM.setCookie = function(cookieName, cookieValue, cookieType) {
	var cookieStr	= cookieName + "=" + escape(cookieValue) + "; path=/";
	if (cookieType == "S") {
		// session cookie
		var date = new Date();
		date.setTime(date.getTime()+(60*60*1000)+(15*60*1000)); // session time of 1 hour and 15 minutes
		cookieStr += "; expires=" + date.toGMTString();
	}
	else {
		// permanent cookie
		var date = new Date();
		date.setTime(date.getTime()+(1000*24*60*60*1000)); // session time of 1000 days
		cookieStr += "; expires=" + date.toGMTString();
	}
	// always reset cookie
	document.cookie = cookieStr;
}
LM.removeCookie = function (cookieName) { //reset cookie with provided name that expires immediately
    var date = new Date();
    date.setTime(date.getTime()); //Set expiry to now
    document.cookie = cookieName + "=; path=/; expires=" + date.toGMTString();
}
//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
// Generate unique(ish) user id
//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
LM.GUID = function() {
   return (LM.Random4()+LM.Random4()+"-"+LM.Random4()+"-"+LM.Random4()+"-"+LM.Random4()+"-"+LM.Random4()+LM.Random4()+LM.Random4());
}
LM.Random4 = function() {
   return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}


//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
// Add custom fields
//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
LM.addCustomField = function(fieldName, fieldValue) {
	LM.config(fieldName, fieldValue);
}

//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
// Track item in basket
//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
LM.addBasketItem = function (params, srcObj) {
    if (LM.DataRequestReady) {
        LM.sendTracking(2, params, srcObj);
    }
    else {
        LM.BasketItems.push(params);
    }
}

//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
// Track item in basket using cookie
//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
LM.addBasketItemCookie = function (params) {
    var cookieValue = params["sku"] + ":" + params["qty"];
    LM.setCookie("LMBASKET", cookieValue, "S");
}

//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
// Track new order
//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
LM.addOrder = function(params) {
	LM.OrderHeader.push(params);
}

//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
// Track order line purchase
//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
LM.addOrderItem = function(params, srcObj) {
	if (LM.DataRequestReady) {
		LM.sendTracking(3, params, srcObj);
    }
    else {
        LM.OrderItems.push(params);
	}
}

//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
// First call from server
//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
LM.buildStart = function() {
	LM.FirstResponseTime = new Date();
}

//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
// Called by server and sets/generates the
// zone html
//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
LM.buildZone = function(params) {
	var idx = parseInt(params["idx"]);
	var zone = LM.Zones[idx]["element"];
	zone.espParams = params;
	zone.espParams["jsStart"] = new Date();
	zone.setAttribute("data-esp-click", params["tracking"]);
	// check if should lazyload
	if (LM.LazyLoadZone != null && LM.LazyLoadZone == params["zoneRef"]) {
		// get lazy load container
		var lazyLoadContainer = null;
		var children = zone.getElementsByTagName("*");
		for (var ii = 0; ii < children.length; ii++) {
			var roleAttr = children[ii].getAttribute ? children[ii].getAttribute("data-role") : null;
			if (roleAttr != null && roleAttr == "fsmlazyloadcontainer") {
				lazyLoadContainer = children[ii];
				break;
			}
		}
		if (lazyLoadContainer != null) {
			// get new lazy load html
			var newlazyLoadContainer = null;
			var newContent = document.createElement("div");
			newContent.innerHTML = params["html"];
			var newChildren = newContent.getElementsByTagName("*");
			for (var ii = 0; ii < newChildren.length; ii++) {
				var roleAttr = newChildren[ii].getAttribute ? newChildren[ii].getAttribute("data-role") : null;
				if (roleAttr != null && roleAttr == "fsmlazyloadcontainer") {
					newlazyLoadContainer = newChildren[ii];
					break;
				}
			}
			// append new lazy load html
			while (newlazyLoadContainer.children.length > 0) {
				lazyLoadContainer.appendChild(newlazyLoadContainer.children[0]);
			}
		}
		if (LM.FacetMode == "data") {
			// run any custom scripts for facets UI
			if (params["facetData"]) {
				for (var ii = 0; ii < LM._syncFacets.length; ii++) {
					if (typeof (LM._syncFacets[ii]) === "function") LM._syncFacets[ii](params);
				}
			}
		}
		LM.LazyLoadZone = null;
		LM.LazyLoadPage = null;
		LM.LazyLoadHits = null;
	}
	else {
		zone.innerHTML = params["html"];
		if (LM.FacetMode == "html" || LM.FacetMode == "mixed") {
			// load up facets html
			try {
				var facetAttr = zone.attributes["facetdomid"] || zone.attributes["locayta:facetdomid"];
				if (facetAttr) {
					var facet = document.getElementById(facetAttr.value);
					facet.innerHTML = params["facetHtml"] || "";
					facet.setAttribute("data-esp-click", params["tracking"]);
				}
			}
			catch (e) { }
		}
		else {
			// run any custom scripts for facets UI
			if (params["facetData"]) {
				for (var ii = 0; ii < LM._syncFacets.length; ii++) {
					if (typeof (LM._syncFacets[ii]) === "function") LM._syncFacets[ii](params);
				}
			}
		}
		// load up filters html
		try {
			var filterAttr = zone.attributes["filterdomid"] || zone.attributes["locayta:filterdomid"];
			if (filterAttr) {
				var filter = document.getElementById(filterAttr.value);
				filter.innerHTML = params["filterHtml"] || "";
				filter.setAttribute("data-esp-click", params["tracking"]);
			}
		}
		catch (e) { }
	}
	if (params["appliedSearchOperator"]) {
		LM.SearchOperator = params["appliedSearchOperator"];
	}
	zone.espParams["jsEnd"] = new Date();
}

//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
// Special rule type, redirect to another page
//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
LM.redirect = function (params) {
	var idx = parseInt(params["idx"]);
	var zone = LM.Zones[idx]["element"];
	zone.espParams = params;
	zone.espParams["jsStart"] = new Date();
	zone.setAttribute("data-esp-click", params["tracking"]);
	if (params["targetUrl"]) {
		var isOverlay = params["overlay"] === true;
		if (!isOverlay) {
			window.location = params["targetUrl"];
		}
	}
	zone.espParams["jsEnd"] = new Date();
}

//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
// Fires when all zones have been populated
//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
LM.buildComplete = function (params) {
    LM.ResponseCompleteTime = new Date();
    LM.ServerTime = params["serverTime"];
    LM.ServerRef = params["serverRef"];
    if (params["cacheSize"]) LM.CacheSize = params["cacheSize"];
    if (params["totalCachedInstances"]) LM.TotalCachedRules = params["totalCachedInstances"];
	if (params["trackedView"]) LM.TrackedView = params["trackedView"];
	if (params["trackedAddsToBasket"]) LM.TrackedAddsToBasket = params["trackedAddsToBasket"];
	if (params["trackedPurchases"]) LM.TrackedPurchases = params["trackedPurchases"];
	if (params["culture"]) LM.ServerCulture = params["culture"];
	if (params["currency"]) LM.ServerCurrency = params["currency"];
	if (params["language"]) LM.ServerLanguage = params["language"];
	if (params["overlayCaching"]) LM.OverlayCaching = params["overlayCaching"] == "true";
	if (params["serverVersion"]) LM.ServerVersion = params["serverVersion"];

    // run any custom scripts
	var completeArgs = {zones: params["zones"]}
    for (var ii = 0; ii < LM._complete.length; ii++) {
        try {
        	if (typeof (LM._complete[ii]) === "function") LM._complete[ii](completeArgs);
        }
        catch (e) { }
    }
    if (LM.OnComplete) { // legacy
        try {
            LM.OnComplete();
        }
        catch (e) { }
    }
    // track link clicks
    try {
        var links = document.getElementsByTagName("a");
        for (var ii = 0; ii < links.length; ii++) {
            var link = links[ii];
            if (link.addEventListener) {
                link.addEventListener("click", LM.trackClick, false);
            }
            else if (link.attachEvent) {
                link.attachEvent("onclick", LM.trackClick);
            }
        }
    }
    catch (e) { }
    // track input clicks
    try {
        var inputs = document.getElementsByTagName("input");
        for (var ii = 0; ii < inputs.length; ii++) {
            var input = inputs[ii];
            if (input.getAttribute("type") && input.getAttribute("type") == "submit" || input.getAttribute("type") == "image") {
                if (input.addEventListener) {
                    input.addEventListener("click", LM.trackClick, false);
                }
                else if (input.attachEvent) {
                    input.attachEvent("onclick", LM.trackClick);
                }
            }
        }
    }
    catch (e) { }
    // track form submits
    try {
        var forms = document.getElementsByTagName("form");
        for (var ii = 0; ii < forms.length; ii++) {
            var form = forms[ii];
            if (form.addEventListener) {
                form.addEventListener("submit", LM.trackClick, false);
            }
            else if (form.attachEvent) {
                form.attachEvent("onsubmit", LM.trackClick);
            }
        }
    }
    catch (e) { }
    // overlay
    if (LM.AK != null && params["overlay"] == true) {
        var headTag = document.getElementsByTagName("head")[0];
        var espOverlayScript = document.createElement("script");
        espOverlayScript.type = "text/javascript";

        var espQuery = LM.buildESPQuery();

        espOverlayScript.src = LM.Domain + "/zones-admin-js.aspx" + espQuery;
        headTag.appendChild(espOverlayScript);
    }
    // may need to reload with filters
    if (LM.ReloadWithFilters) {
        LM.ReloadWithFilters = false;
        LM.FacetMode = "data";
        LM.MergeHash = true;
        LM.getData();
    }
}

//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
// Fires when tracking request is complete
//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
LM.trackingComplete = function (params) {
	for (var ii = 0; ii < LM._trackComplete.length; ii++) {
        try {
            if (typeof (LM._trackComplete[ii]) === "function") LM._trackComplete[ii]();
        }
        catch (e) { }
    }	
	if (params["trackedView"]) LM.TrackedView = params["trackedView"];
	if (params["trackedAddsToBasket"]) LM.TrackedAddsToBasket = params["trackedAddsToBasket"];
	if (params["trackedPurchases"]) LM.TrackedPurchases = params["trackedPurchases"];
	if (LM.AK != null) {
		if (LM.overlay !== undefined) LM.overlay();
	}
}

//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
// track click zone and rule
//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
LM.trackClick = function (evt) {
    try {
        var evt = evt || window.event;
        var src = evt.target || evt.srcElement;
        if (src != null) {
            if (src.getAttribute && src.getAttribute("data-esp-click")) {
                LM.TrackingCode = src.getAttribute("data-esp-click");
                LM.setCookie("LMTRACK", LM.TrackingCode, "S");
            }
            else {
                var parent = src.parentNode;
                while (parent) {
                    var espTrackingCode = parent.getAttribute ? parent.getAttribute("data-esp-click") : null;
                    if (espTrackingCode != null && espTrackingCode != "") {
                        LM.TrackingCode = espTrackingCode;
                        LM.setCookie("LMTRACK", espTrackingCode, "S");
                        parent = null;
                    }
                    else {
                        parent = parent.parentNode;
                    }
                }
            }
        }
    }
    catch (e) { }
}

//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
// User storage functions
//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
LM._isLocalStorageSupported = null;
LM.IsLocalStorageSupported = function () {
	if (LM._isLocalStorageSupported == null) {
		try {
			if ('localStorage' in window && window['localStorage'] !== null) {
				localStorage.setItem("storageTest", "");
				localStorage.removeItem("storageTest");

				LM._isLocalStorageSupported = true;
			}
			else {
				LM._isLocalStorageSupported = false;
			}
		}
		catch (e) {
			LM._isLocalStorageSupported = false;
		}
	}

	return LM._isLocalStorageSupported;
}

LM.SetUserStorage = function (key, value) {
	try {
		var data = LM.GetUserStorageData();
		data[key] = value;
		LM.SetUserStorageData(data);
	}
	catch (ex) { }
}

LM.GetUserStorage = function (key) {
	try {
		var data = LM.GetUserStorageData();

		if (data.hasOwnProperty(key)) {
			return data[key];
		}
	}
	catch (ex) { }

	return "";
}

LM.RemoveUserStorage = function (key) {
	try {
		var data = LM.GetUserStorageData();

		if (data.hasOwnProperty(key)) {
			delete data[key];
			LM.SetUserStorageData(data);
		}
	}
	catch (ex) { }
}

LM.GetUserStorageData = function () {
	if (LM.IsLocalStorageSupported()) {
		var data = LM.JSONParse(localStorage.getItem("LMDATA"));

		return (data || {});
	}
	else {
		var data = LM.JSONParse(LM.getCookie("LMDATA"));

		return (data || {});
	}
}

LM.SetUserStorageData = function (data) {
	if (LM.IsLocalStorageSupported()) {
		localStorage.removeItem("LMDATA");
		localStorage.setItem("LMDATA", LM.JSONStringify(data));
	}
	else {
		LM.setCookie("LMDATA", LM.JSONStringify(data));
	}
}

LM.UpdateUserPurchaseData = function (orderItems) {
	try {
		var data = LM.GetUserStorageData();
		var oldCount = parseInt(data["FSM_OrderCount"] || "0");
		var count = 0;
		var total = 0;
		var skus = (data["FSM_RecentSKUs"] || []);

		for (var ii = 0; ii < orderItems.length; ii++) {
			var order = orderItems[ii];
			var inSkus = false;

			for (var jj = 0; jj < skus.length; jj++) {
				if (skus[jj] === order["sku"]) {
					inSkus = true;
					break;
				}
			}

			if (!inSkus) {
				skus.push(order["sku"]);
			}

			if (order.hasOwnProperty("lineprice")) {
				count++;
				total = total + parseFloat(order["lineprice"] || "0");
			}
		}

		data["FSM_OrderCount"] = oldCount + count;

		if (data.hasOwnProperty("FSM_AvgOrderValue")) {
			data["FSM_AvgOrderValue"] = (((oldCount * parseInt(data["FSM_AvgOrderValue"] || "0")) + total) / data["FSM_OrderCount"]).toFixed(2);
		}
		else {
			data["FSM_AvgOrderValue"] = total / count;
		}

		if (skus.length > 11) { 
			skus = skus.slice(skus.length - 11);
		}

		data["FSM_RecentSKUs"] = skus;
		var date = new Date();
		data["FSM_LastOrderDate"] = (date.getDate() < 10 ? "0" : "") + date.getDate() + "/" + (date.getMonth() < 9 ? "0" : "") + (date.getMonth() + 1) + "/" + date.getFullYear();
		LM.SetUserStorageData(data);
	}
	catch (ex) { }
}

LM.JSONStringify = function (json) {
	var dataStr = "";

	if (json !== undefined && json != null) {
		try {
			for (var data in json) {
				if (json[data] instanceof Array) {
					dataStr += (dataStr == "" ? data + ":" + json[data].join() : "|" + data + ":" + json[data].join());
				}
				else {
					dataStr += (dataStr == "" ? data + ":" + json[data] : "|" + data + ":" + json[data]);
				}
			}
		}
		catch (ex) { }
	}

	return dataStr;
}

LM.JSONParse = function (string) {
	var json = {};

	if (string !== undefined && string !== null && string.length > 0) {
		try {
			var dataArray = string.split("|");
			for (var ii = 0; ii < dataArray.length; ii++) {
				var data = dataArray[ii].split(":");
				if (data.length == 2) {
					var name = data[0];
					var val = data[1];
					if (val.split(",").length > 0) {
						json[name] = val.split(",");
					}
					else {
						json[name] = val;
					}
				}
			}
		}
		catch (ex) { }
	}

	return json;
}

//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
// Returns ie version number.
// If you're not in IE, or IE version is less than 5 then 
// LM.ie === undefined
//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
LM.ie = (function () {
	var undef,
        v = 3,
        div = document.createElement('div'),
        all = div.getElementsByTagName('i');

	while (
        div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
        all[0]
    );

	return v > 4 ? v : undef;
}());

//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
// Trap hash change events so that we can reload content when
// history is envoked
//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
try {
	if (!('onhashchange' in window) || LM.ie == 7) {
		var oldHash = LM.getHashFromWindowLocation();
		setInterval(function () {
			var newHash = LM.getHashFromWindowLocation();
			if (oldHash !== newHash) {
				oldHash = newHash;
				if (LM.MergeHash && LM.CurrentHash != newHash) {
					LM.CurrentHash = newHash;
					LM.getData();
				}
			}
		}, 100);
	}
	else if (window.addEventListener) {
		window.addEventListener("hashchange", function () {
			var hash = LM.getHashFromWindowLocation();
			if (LM.MergeHash && LM.CurrentHash != hash) {
				LM.CurrentHash = hash;
				LM.getData();
			}
		}, false);
	}
	else if (window.attachEvent) {
		window.attachEvent("onhashchange", function () {
			var hash = LM.getHashFromWindowLocation();
			if (LM.MergeHash && LM.CurrentHash != hash) {
				LM.CurrentHash = hash;
				LM.getData();
			}
		});
	}
}
catch (e) { }


//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
// Setup "onready" event so that init fires when the DOM loads.
//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
// DOMContentLoaded is ideal ...
try {
    if (document.addEventListener) {
        document.addEventListener("DOMContentLoaded", function () { LM.init("DOMContentLoaded"); }, false);
    }
}
catch (e) { }
try {
	if (navigator.appName == "Microsoft Internet Explorer") {
		// For IE less than IE9
		// similar to onload (fires quite late), but better suited to iframes/frames
		document.attachEvent("onreadystatechange", function() {
			if (document.readyState === "complete") {
				document.detachEvent("onreadystatechange", arguments.callee);
				LM.init("onreadystatechange");
			}
		});
		// uses doScroll event to approximate when DOM ready (only works for non frames)
		if (document.documentElement.doScroll && window == window.top) {
			(function() {
				try {
					document.documentElement.doScroll("left");
					LM.init("doScroll");
				}
				catch (_lm_error) {
					setTimeout(arguments.callee, 0);
					return;
				}
			})();
		}
	}
	else {
		// ... for non IE document.readyState isn't a bad fallback for DOMContentLoaded
		if (document.readyState) {
			var espTimer = setInterval(function() {
				if (/loaded|complete/.test(document.readyState)) {
					clearInterval(espTimer);
					LM.init("readyState");
				}
			}, 5);
		}
	}
}
catch (e) { }
// Fallback methods
if (window.addEventListener) {
	window.addEventListener("load", LM.init, false);
}
else if (document.addEventListener) {
	document.addEventListener("load", LM.init, false);
}
else if (window.attachEvent) {
	window.attachEvent("onload", LM.init);
}
else if (document.attachEvent) {
	document.attachEvent("onload", LM.init);
}
else {
	window.onload = LM.init;
}

//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
// Multiselect javascript
//#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#
LM.Multi_IsInit = false;
LM.Multi_Zone = null;
LM.Multi_FacetContainer = null;
LM.Multi_FilterContainer = null;
LM.Multi_CurrentField = null;
LM.Multi_PriceField = "sys_price"
LM.Multi_FixedPriceFacet = true;
LM.Multi_PriceSliderMin = null;
LM.Multi_PriceSliderMax = null;
LM.Multi_IsSearchPage = false;
LM.Multi_LoadingMask = null;
LM.Multi_ScrollToTop = true;
LM.Multi_ScrollTo = 0;
LM.Multi_ScrollDuration = 250;
LM.Multi_IgnoreScroll = false;
LM._multi_init = [];
LM._multi_setFilters = [];
LM._multi_toggleFacetItem = [];
LM._multi_resetPriceSlider = [];
LM._multi_setPriceSlider = [];

// Allow custom event handlers for facet state toggle
LM.multi_toggleFacetItem = function (fn) {
	LM._multi_toggleFacetItem.push(fn);
};

// Allow custom event handlers for set filters
LM.multi_setFilters = function (fn) {
	LM._multi_setFilters.push(fn);
}

// Allow custom event handlers for resetting price slider
LM.multi_resetPriceSlider = function (fn) {
	LM._multi_resetPriceSlider.push(fn);
}

// Allow custom event handlers for setting price slider
LM.multi_setPriceSlider = function (fn) {
	LM._multi_setPriceSlider.push(fn);
}

// Allow custom event handlers
LM.multi_init = function (fn) {
	LM._multi_init.push(fn);
}

LM.Utils.ElementOffset = function (srcElement) {
	var iXCoord = srcElement.offsetLeft;
	var iYCoord = srcElement.offsetTop;
	while (srcElement.offsetParent != null) {
		srcElement = srcElement.offsetParent;
		iXCoord += srcElement.offsetLeft;
		iYCoord += srcElement.offsetTop;
	}
	return { X: iXCoord, Y: iYCoord };
}

LM.Utils.ElementQuery = function (query, root) {
	root = root || document;
	// if browser doesn't support Selectors API, use a basic fallback
	if (root.querySelectorAll) { 
		return root.querySelectorAll(query);
	}
	else {
		var qId;
		var qClass;
		var qTag;
		var qAttributes;
		var start = query.split("[", 1)[0];
		var ch = start.slice(0, 1);
		if (ch == "#") {
			qId = start.slice(1);
			if (qId && qId.length > 0) {
				return root.getElementById(qId);
			}
		}
		else if (ch == ".") {
			qClass = start.slice(1);
		}
		else if (start.indexOf(".") !== -1) {
			qClass = start.slice(start.indexOf(".") + 1);
			qTag = start.slice(0, start.indexOf("."));
		}
		else {
			qTag = start;
		}

		if (query.indexOf("[") !== -1) {
			qAttributes = [];
			var attrQuery = query.slice(start.length + 1, query.length - 1);
			if (attrQuery && attrQuery.length) {
				var attrs = attrQuery.split("][");
				for (var ii = 0; ii < attrs.length; ii++) {
					qAttributes.push({
						att: (attrs[ii].split("=")[0] || "").replace(/[\[\]']+/g, ""),
						val: (attrs[ii].split("=")[1] || "").replace(/["']/g, "")
					});
				}
			}
		}

		var allElements = [];
		if (qClass && qClass.length > 0) {
			var els = root.getElementsByClassName(qClass);
			if (qTag && qTag.length > 0) {
				for (var ii = 0; ii < els.length; ii++) {
					if (els[ii].tagName.toLowerCase() == qTag) {
						allElements.push(els[ii]);
					}
				}
			}
			else {
				allElements = els;
			}
		}
		else if (qTag && qTag.length > 0) {
			allElements = root.getElementsByTagName(qTag);
		}
		else { 
			allElements = root.getElementsByTagName('*');
		}

		if (qAttributes && qAttributes.length > 0) {
			var matchingElements = [];
			for (var ii = 0; ii < allElements.length; ii++) {
				var match = true;
				for (var jj = 0; jj < qAttributes.length; jj++) {
					if (qAttributes[jj].att != "" && qAttributes[jj].val != "") {
						var hasAtt = allElements[ii].hasAttribute ? allElements[ii].hasAttribute(qAttributes[jj].att) : !!allElements[ii][qAttributes[jj].att];
						if (!hasAtt || allElements[ii].getAttribute(qAttributes[jj].att).toString() != qAttributes[jj].val) {
							match = false;
						}
					}
					else if (qAttributes[jj].att != "") {
						var hasAtt = allElements[ii].hasAttribute ? allElements[ii].hasAttribute(qAttributes[jj].att) : !!allElements[ii][qAttributes[jj].att];
						if (!hasAtt) {
							match = false;
						}
					}
				}
				if (match) {
					matchingElements.push(allElements[ii]);
				}
			}

			return matchingElements;
		}
		else {
			return allElements;
		}
	}
}

LM.Utils.AttachDelegateEventByAttribute = function (element, evnt, attributeName, attributeValue, fxn) {
	if (element.addEventListener) {
		element.addEventListener(evnt, function (e) {
			var evt = e || window.event;
			var target = evt.target || evt.srcElement;
			var hasAtt = target.hasAttribute ? target.hasAttribute(attributeName) : !!target[attributeName];
			if (target && hasAtt && target.getAttribute(attributeName) == attributeValue) {
				evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;
				fxn(evt, target);	
			}
		}, false);
	}
	else if (element.attachEvent) {
		element.attachEvent("on" + evnt, function (e) {
			var evt = e || window.event;
			var target = evt.target || evt.srcElement;
			var hasAtt = target.hasAttribute ? target.hasAttribute(attributeName) : !!target[attributeName];
			if (target && hasAtt && target.getAttribute(attributeName) == attributeValue) {
				fxn(evt, target);
				evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;
			}
		});
	}
}

LM.Multi_DelegateEventByAttribute = function (element) {	
	if (element === undefined) return;	
	var hasAtt = element.hasAttribute ? element.hasAttribute("data-role") : !!element["data-role"];
	var isLMZone = element.hasAttribute ? element.hasAttribute("lmzone") : !!element["lmzone"];

	while (!hasAtt && !isLMZone) {
		element = element.parentNode;
		if (element && element != null) {
			hasAtt = element.hasAttribute ? element.hasAttribute("data-role") : !!element["data-role"];
			isLMZone = element.hasAttribute ? element.hasAttribute("lmzone") : !!element["lmzone"];
		}
		else {
			hasAtt = false;
			break;
		}
	}

	if (!hasAtt) return false;
	
	var returnArgs = false;

	// Bind facet items click event
	if (element.getAttribute("data-role") == "fsmfacetitem" && element.tagName.toLowerCase() != "option") {
		LM.Multi_ResetFilters(element);
		if (element.tagName.toLowerCase() != "input") {
			returnArgs = { target: element, preventDefault: true };
		}
	}

	// Bind hits per page events
	if (element.getAttribute("data-role") == "fsmhitslink") {
		var hitsLinks = LM.Utils.ElementQuery("[data-role='fsmhitslink']", LM.Multi_Zone);
		LM.Multi_SetHitsPerPage(element.getAttribute("data-hits"));
		for (var ii = 0; ii < hitsLinks.length; ii++) {
			hitsLinks[ii].setAttribute("data-selected", "false");
		}
		element.setAttribute("data-selected", "true");
		returnArgs = { target: element, preventDefault: true };
	}

	// Bind paging events
	if (element.getAttribute("data-role") == "fsmpaginglink") {
		LM.Multi_SetPage(element.getAttribute("data-page"));
		returnArgs = { target: element, preventDefault: true };
	}

	// Bind lazy load events
	if (element.getAttribute("data-role") == "fsmlazyload") {
		var page = element.getAttribute("data-page");
		page = page != null ? parseInt(page) : 2;
		element.setAttribute("data-page", page + 1);
		var hits = element.getAttribute("data-hits");
		hits = hits != null ? parseInt(hits) : null;
		LM.Multi_LazyLoad(element, page, hits);
		returnArgs = { target: element, preventDefault: true };
	}

	// Bind sorting events
	if (element.getAttribute("data-role") == "fsmsortinglinks") {
		var sortingLinks = LM.Utils.ElementQuery("[data-role='fsmsortinglinks']", LM.Multi_Zone);
		LM.Multi_SortProducts(element.getAttribute("data-sortfield"), element.getAttribute("data-sortorder"));
		for (var ii = 0; ii < sortingLinks.length; ii++) {
			sortingLinks[ii].setAttribute("data-selected", "false");
		}
		element.setAttribute("data-selected", "true");
		returnArgs = { target: element, preventDefault: true };
	}

	// Bind view all events
	if (element.getAttribute("data-role") == "fsmviewall") {
		LM.Multi_ViewAll();
		returnArgs = { target: element, preventDefault: true };
	}

	// Bind clear facet items event
	if (element.getAttribute("data-role") == "fsmfacetclear") {
		LM.Multi_ClearFilter(element.getAttribute("data-field"), element.getAttribute("data-value"));
		returnArgs = { target: element, preventDefault: true };
	}

	// Bind clear all event
	if (element.getAttribute("data-role") == "fsmfacetclearall") {
		LM.Multi_ClearAllFilters();
		returnArgs = { target: element, preventDefault: true };
	}
	
	return returnArgs;
}

LM.Multi_Init = function () {
	lmZones = LM.Utils.ElementQuery("[lmzone]");
	if (lmZones && lmZones.length > 0) {
		if (lmZones.length > 1) {
			for (var ii = 0; ii < lmZones.length; ii++) {
				LM.Multi_Zone = lmZones[ii];			
				var hasFacetAtt = LM.Multi_Zone.hasAttribute ? LM.Multi_Zone.hasAttribute("facetdomid") : !!LM.Multi_Zone["facetdomid"];
				LM.Multi_FacetContainer = hasFacetAtt ? document.getElementById(LM.Multi_Zone.getAttribute("facetdomid")) : null;
				var hasFilterAtt = LM.Multi_Zone.hasAttribute ? LM.Multi_Zone.hasAttribute("filterdomid") : !!LM.Multi_Zone["filterdomid"];
				LM.Multi_FilterContainer = hasFilterAtt ? document.getElementById(LM.Multi_Zone.getAttribute("filterdomid")) : null;
				
				if (hasFacetAtt || hasFacetAtt) {
					break;
				}
			}
		}
		else {
			LM.Multi_Zone = lmZones[0];
			var hasFacetAtt = LM.Multi_Zone.hasAttribute ? LM.Multi_Zone.hasAttribute("facetdomid") : !!LM.Multi_Zone["facetdomid"];
			LM.Multi_FacetContainer = hasFacetAtt ? document.getElementById(LM.Multi_Zone.getAttribute("facetdomid")) : null;
			var hasFilterAtt = LM.Multi_Zone.hasAttribute ? LM.Multi_Zone.hasAttribute("filterdomid") : !!LM.Multi_Zone["filterdomid"];
			LM.Multi_FilterContainer = hasFilterAtt ? document.getElementById(LM.Multi_Zone.getAttribute("filterdomid")) : null;
		}
	}
	else {
		return;
	}

	// Add delegate event listeners
	// lmzone Content
	if (LM.Multi_Zone) {
		if (LM.Multi_Zone.addEventListener) {
			LM.Multi_Zone.addEventListener("click", function (e) {
				var evt = e || window.event;
				var target = evt.target || evt.srcElement;
				var delegateEvt = LM.Multi_DelegateEventByAttribute(target);
				if (delegateEvt !== undefined && delegateEvt != false) {
					delegateEvt.target.removeAttribute("href");
					if (delegateEvt.preventDefault) {
						evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;
					}
				}
			}, false);
		}
		else if (LM.Multi_Zone.attachEvent) {
			LM.Multi_Zone.attachEvent("onclick", function (e) {
				var evt = e || window.event;
				var target = evt.target || evt.srcElement;
				var delegateEvt = LM.Multi_DelegateEventByAttribute(target);
				if (delegateEvt !== undefined && delegateEvt != false) {
					delegateEvt.target.removeAttribute("href");
					if (delegateEvt.preventDefault) {
						evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;
					}
				}
			});
		}
	}
	// facets content
	if (LM.Multi_FacetContainer) {
		if (LM.Multi_FacetContainer.addEventListener) {
			LM.Multi_FacetContainer.addEventListener("click", function (e) {
				var evt = e || window.event;
				var target = evt.target || evt.srcElement;
				var delegateEvt = LM.Multi_DelegateEventByAttribute(target);
				if (delegateEvt !== undefined && delegateEvt != false) {
					delegateEvt.target.removeAttribute("href");
					if (delegateEvt.preventDefault) {
						evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;
					}
				}
			}, false);
		}
		else if (LM.Multi_FacetContainer.attachEvent) {
			LM.Multi_FacetContainer.attachEvent("onclick", function (e) {
				var evt = e || window.event;
				var target = evt.target || evt.srcElement;
				var delegateEvt = LM.Multi_DelegateEventByAttribute(target);
				if (delegateEvt !== undefined && delegateEvt != false) {
					delegateEvt.target.removeAttribute("href");
					if (delegateEvt.preventDefault) {
						evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;
					}
				}
			});
		}
	}
	// filters content
	if (LM.Multi_FilterContainer) {
		if (LM.Multi_FilterContainer.addEventListener) {
			LM.Multi_FilterContainer.addEventListener("click", function (e) {
				var evt = e || window.event;
				var target = evt.target || evt.srcElement;
				var delegateEvt = LM.Multi_DelegateEventByAttribute(target);
				if (delegateEvt !== undefined && delegateEvt != false) {
					delegateEvt.target.removeAttribute("href");
					if (delegateEvt.preventDefault) {
						evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;
					}
				}
			}, false);
		}
		else if (LM.Multi_FilterContainer.attachEvent) {
			LM.Multi_FilterContainer.attachEvent("onclick", function (e) {
				var evt = e || window.event;
				var target = evt.target || evt.srcElement;
				var delegateEvt = LM.Multi_DelegateEventByAttribute(target);
				if (delegateEvt !== undefined && delegateEvt != false) {
					delegateEvt.target.removeAttribute("href");
					if (delegateEvt.preventDefault) {
						evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;
					}
				}
			});
		}
	}

	// Hide clear links
	var clearLinks = LM.Utils.ElementQuery("[data-role='fsmfacetclear']", LM.Multi_FacetContainer);
	if (clearLinks) {
		for (var ii = 0; ii < clearLinks.length; ii++) {
			clearLinks[ii].style.visibility = "hidden";
		}
	}
	
	var clearAllLinks = LM.Utils.ElementQuery("[data-role='fsmfacetclearall']", LM.Multi_FacetContainer);
	if (clearAllLinks) {
		for (var ii = 0; ii < clearAllLinks.length; ii++) {
			clearAllLinks[ii].style.visibility = "hidden";
		}
	}

	// Run any custom scripts
	for (var ii = 0; ii < LM._multi_init.length; ii++) {
		try {
			if (typeof (LM._multi_init[ii]) === "function") LM._multi_init[ii]();
		}
		catch (e) { }
	}

	// Register fixed facet or set price slider values
	if (LM.Multi_FixedPriceFacet) {
		var vals = [];
		var priceFacets = LM.Utils.ElementQuery("[data-role='fsmfacetitem'][data-field='" + LM.Multi_PriceField + "']", LM.Multi_FacetContainer);
		for (var ii = 0; ii < priceFacets.length; ii++) {
			var value = priceFacets[ii].getAttribute("data-value");
			if (value != null) {
				vals.push(priceFacets[ii].getAttribute("data-value").split(":"));
			}
		}
		LM.registerFixedFacet(LM.Multi_PriceField, vals);
	}
	else {
		// Set price slider min and max from hash
		var hashPrices = LM.Multi_GetHashPriceValues();
		if (hashPrices != null) {
			var options = hashPrices.split(":");
			var minVal = parseInt(options[0]);
			var maxVal = parseInt(options[1]);

			LM.Multi_PriceSliderMin = minVal;
			LM.Multi_PriceSliderMax = maxVal;

			// Run any custom scripts
			for (var ii = 0; ii < LM._multi_setPriceSlider.length; ii++) {
				try {
					if (typeof (LM._multi_setPriceSlider[ii]) === "function") {
						filters = LM._multi_setPriceSlider[ii](minVal, maxVal);
					}
				}
				catch (e) { }
			}
		}
	}

	// Add Array.indexOf for ie
	if (!Array.prototype.indexOf) {
		Array.prototype.indexOf = function (searchElement /*, fromIndex */) {
			"use strict";
			if (this == null) {
				throw new TypeError();
			}
			var t = Object(this);
			var len = t.length >>> 0;
			if (len === 0) {
				return -1;
			}
			var n = 0;
			if (arguments.length > 1) {
				n = Number(arguments[1]);
				if (n != n) { // shortcut for verifying if it's NaN
					n = 0;
				} else if (n != 0 && n != Infinity && n != -Infinity) {
					n = (n > 0 || -1) * Math.floor(Math.abs(n));
				}
			}
			if (n >= len) {
				return -1;
			}
			var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
			for (; k < len; k++) {
				if (k in t && t[k] === searchElement) {
					return k;
				}
			}
			return -1;
		}
	}

	LM.Multi_IsInit = true;
}

LM.Multi_BindSelectEvents = function () {
	// Bind facet events
	var facetSelects = LM.Utils.ElementQuery("[data-role='fsmfacetselect']", LM.Multi_FacetContainer);
	if (facetSelects && facetSelects.length) {
		for (var ii = 0; ii < facetSelects.length; ii++) {
			facetSelects[ii].onchange = function (e) {
				var evt = e || window.event;
				var target = evt.target || evt.srcElement;
				var option = target.options[target.selectedIndex];
				LM.Multi_ResetFilters(option);
			};
		}
	}
	
	// Bind hits per page events
	var hitsSelects = LM.Utils.ElementQuery("[data-role='fsmhitsselect']", LM.Multi_Zone);
	if (hitsSelects && hitsSelects.length > 0) {
		for (var ii = 0; ii < hitsSelects.length; ii++) {
			hitsSelects[ii].onchange = function (e) {
				var evt = e || window.event;
				var target = evt.target || evt.srcElement;
				if (target.value == "viewall") {
					LM.Multi_ViewAll();
				}
				else {
					LM.Multi_SetHitsPerPage(target.value);
				}
			};
		}
	}

	// Bind paging events
	var pagingSelects = LM.Utils.ElementQuery("[data-role='fsmpagingselect']", LM.Multi_Zone);
	if (pagingSelects && pagingSelects.length) {
		for (var ii = 0; ii < pagingSelects.length; ii++) {
			pagingSelects[ii].onchange = function (e) {
				var evt = e || window.event;
				var target = evt.target || evt.srcElement;
				LM.Multi_SetPage(target.value);
			};
		}
	}

	// Bind sorting events
	var sortingSelects = LM.Utils.ElementQuery("[data-role='fsmsortingselect']", LM.Multi_Zone);
	if (sortingSelects && sortingSelects.length) {
		for (var ii = 0; ii < sortingSelects.length; ii++) {
			sortingSelects[ii].onchange = function (e) {
				var evt = e || window.event;
				var target = evt.target || evt.srcElement;
				var field = target.value.split(":")[0];
				var order = target.value.split(":")[1];
				LM.Multi_SortProducts(field, order);
			};
		}
	}
}

// Get current field from hash, else return null
LM.Multi_GetCurrentField = function () {
	var hashKeyValues = LM.getHashKeyValues();
	for (var i = 0; i < hashKeyValues.length; i++) {
		if (hashKeyValues[i].indexOf(LM.QueryPrefix + "cf=") == 0) {
			return decodeURIComponent(hashKeyValues[i].split("=")[1]);
		}
	}
	return null;
}

// Get price field values from hash, else return null
LM.Multi_GetHashPriceValues = function () {
	var hashKeyValues = LM.getHashKeyValues();
	for (var i = 0; i < hashKeyValues.length; i++) {
		if (hashKeyValues[i].indexOf(LM.QueryPrefix + "filter_sys_price=") == 0) {
			return decodeURIComponent(hashKeyValues[i].split("=")[1]);
		}
	}
	return null;
}

// Reset function called by standard multi select links
LM.Multi_ResetFilters = function (link) {
	var hasEnabledAtt = link.hasAttribute ? link.hasAttribute("data-enabled") : !!link["data-enabled"];
	var enabled = hasEnabledAtt && link.getAttribute("data-enabled").toString() == "true";
	if (!enabled) return; // the option is disabled, take no action
	LM.Multi_CurrentField = link.getAttribute("data-field");
	var hasCheckedAtt = link.hasAttribute ? link.hasAttribute("data-checked") : !!link["data-checked"];
	var checked = hasCheckedAtt && link.getAttribute("data-checked").toString() == "true";
	// Custom logic for search which can only have 1 price band at a time
	if (!checked && LM.Multi_IsSearchPage && LM.Multi_CurrentField == LM.Multi_PriceField) {
		var priceFacetItems = LM.Utils.ElementQuery("[data-role='fsmfacetitem'][data-field='" + LM.Multi_PriceField + "'][data-checked='true']", LM.Multi_FacetContainer);
		for (var ii = 0; ii < priceFacetItems.length; ii++) {
			priceFacetItems[ii].setAttribute("data-checked", "false");
			LM.Multi_ToggleFacetItem(link, "checked", false);
		}
	}
	// Custom logic end
	link.setAttribute("data-checked", !checked + "");

	LM.Multi_ToggleFacetItem(link, "checked", !checked);

	LM.Multi_SetFilters();
}

// Set filters
LM.Multi_SetFilters = function () {
	var filters = {};
	var checkedFacets = LM.Utils.ElementQuery("[data-role='fsmfacetitem'][data-checked='true']", LM.Multi_FacetContainer);
	for (var ii = 0; ii < checkedFacets.length; ii++) {
		var field = checkedFacets[ii].getAttribute("data-field");
		var value = checkedFacets[ii].getAttribute("data-value");
		if (field && value) {
			if (!filters[field]) filters[field] = [];
			filters[field].push(value);
		}
	}
	// If using price slider
	if (!LM.Multi_FixedPriceFacet) {
		if (LM.Multi_PriceSliderMin != null && LM.Multi_PriceSliderMax != null) {
			if (!filters[LM.Multi_PriceField]) filters[LM.Multi_PriceField] = [];
			filters[LM.Multi_PriceField].push(LM.Multi_PriceSliderMin + ":" + LM.Multi_PriceSliderMax);
		}
	}
	// Run any custom scripts
	for (var ii = 0; ii < LM._multi_setFilters.length; ii++) {
		try {
			if (typeof (LM._multi_setFilters[ii]) === "function") {
				filters = LM._multi_setFilters[ii](filters);
			}
		}
		catch (e) { }
	}
	LM.setFilters(filters, LM.Multi_CurrentField);
}

// Set sort
LM.Multi_SortProducts = function(field, order) {
	if (field && order) {
		LM.setSortField(field, order);
	}
	else {
		LM.FacetMode = "data";
		LM.MergeHash = true;
		var hash = LM.getHash([LM.QueryPrefix + "sort", LM.QueryPrefix + "order", LM.QueryPrefix + "page", LM.QueryPrefix + "pg"]);
		LM.CurrentHash = "#" + hash;
		window.location.hash = hash;
		LM.getData();
	}
}

// Set page
LM.Multi_SetPage = function (page) {
	LM.setPage(page);
}

// Lazy load
LM.Multi_LazyLoad = function (src, page, hits) {
	LM.Multi_IgnoreScroll = true;
	LM.FacetMode = "data";
	LM.lazyLoad({
		src: src,
		page: page,
		hits: hits,
		zone: LM.Multi_Zone.getAttribute ? LM.Multi_Zone.getAttribute("lmzone") : null
	});
}

// Set hits per page
LM.Multi_SetHitsPerPage = function(hits) {
	LM.setPageView(hits);
}

// Set view all
LM.Multi_ViewAll = function () {
	var hash = LM.getHash([LM.QueryPrefix + "page", LM.QueryPrefix + "pg"]);
	LM.CurrentHash = "#" + hash;
	window.location.hash = hash;
	LM.setPageView("viewall");
}

// Clear all filters
LM.Multi_ClearAllFilters = function () {
	var checkedFacets = LM.Utils.ElementQuery("[data-role='fsmfacetitem'][data-checked='true']", LM.Multi_FacetContainer);
	for (var ii = 0; ii < checkedFacets.length; ii++) {
		LM.Multi_ToggleFacetItem(checkedFacets[ii], "checked", false);
	}
	LM.clearFilters();
	if (!LM.Multi_FixedPriceFacet) {
		// Run any custom scripts for price slider
		for (var ii = 0; ii < LM._multi_resetPriceSlider.length; ii++) {
			try {
				if (typeof (LM._multi_resetPriceSlider[ii]) === "function") {
					LM._multi_resetPriceSlider[ii]();
				}
			}
			catch (e) { }
		}
	}
}

// Clear individual filter
LM.Multi_ClearFilter = function (field, value) {
	var checkedFacets = null;
	if (value !== undefined && value != null && value != "") {
		checkedFacets = LM.Utils.ElementQuery("[data-role='fsmfacetitem'][data-checked='true'][data-field='" + field + "'][data-value='" + value.replace(/'/g, "\\'") + "']", LM.Multi_FacetContainer);
	}
	else {
		checkedFacets = LM.Utils.ElementQuery("[data-role='fsmfacetitem'][data-checked='true'][data-field='" + field + "']", LM.Multi_FacetContainer);
	}

	if (checkedFacets != null) {
		for (var ii = 0; ii < checkedFacets.length; ii++) {
			LM.Multi_ToggleFacetItem(checkedFacets[ii], "checked", false);
		}

		// If price field and using price slider
		if (!LM.Multi_FixedPriceFacet && field == LM.Multi_PriceField) {
			LM.Multi_PriceSliderMin = null;
			LM.Multi_PriceSliderMax = null;
			// Run any custom scripts
			for (var ii = 0; ii < LM._multi_resetPriceSlider.length; ii++) {
				try {
					if (typeof (LM._multi_resetPriceSlider[ii]) === "function") {
						LM._multi_resetPriceSlider[ii]();
					}
				}
				catch (e) { }
			}
		}
	}

	LM.Multi_SetFilters();
}

// Should be triggered on price change
// when using a price slider
LM.Multi_PriceSliderChange = function (min, max) {
	LM.Multi_CurrentField = LM.Multi_PriceField;
	LM.Multi_PriceSliderMin = parseInt(min);
	LM.Multi_PriceSliderMax = parseInt(max);
	LM.Multi_SetFilters();
}

// Toggle facet item state
LM.Multi_ToggleFacetItem = function (facetItem, state, isSate) {
	if (facetItem.tagName.toLowerCase() == "input") {
		if (state == "enabled") {
			facetItem.setAttribute("data-enabled", isSate);
			if (isSate) {
				facetItem.removeAttribute("disabled");
			}
			else {
				facetItem.setAttribute("disabled", "disabled");
			}
		}
		else if (state == "checked") {
			facetItem.setAttribute("data-checked", isSate);
			facetItem.checked = isSate;
		}
	}
	else if (facetItem.tagName.toLowerCase() == "option") {
		if (state == "enabled") {
			facetItem.setAttribute("data-enabled", isSate);
			if (isSate) {
				facetItem.removeAttribute("disabled");
			}
			else {
				facetItem.setAttribute("disabled", "disabled");
			}
		}
		else if (state == "checked") {
			facetItem.setAttribute("data-checked", isSate);
			facetItem.setAttribute("selected", "selected");
		}
	}
	else {
		if (state == "enabled") {
			facetItem.setAttribute("data-enabled", isSate);
		}
		else if (state == "checked") {
			facetItem.setAttribute("data-checked", isSate);
		}
	}

	// Run any custom scripts
	for (var ii = 0; ii < LM._multi_toggleFacetItem.length; ii++) {
		try {
			if (typeof (LM._multi_toggleFacetItem[ii]) === "function") LM._multi_toggleFacetItem[ii](facetItem);
		}
		catch (e) { }
	}
}

LM.Multi_GetScrollTop = function () {
	if (typeof pageYOffset != 'undefined') {
		// Most browsers
		return pageYOffset;
	}
	else {
		var B = document.body; // IE 'quirks'
		var D = document.documentElement; // IE with doctype
		D = (D.clientHeight) ? D : B;
		return D.scrollTop;
	}
}

LM.Multi_AnimateScroll = function (element, to, duration) {
	if (duration < 0) return;
	var difference = to - element.scrollTop;
	var perTick = difference / duration * 10;

	setTimeout(function () {
		element.scrollTop = element.scrollTop + perTick;
		LM.Multi_AnimateScroll(element, to, duration - 10);
	}, 10);
}

LM.load(function () {
	if (LM.Multi_IsInit) {
		// Show loading mask
		if (LM.Multi_LoadingMask != null) {
			LM.Multi_LoadingMask.style.display = "block";
		}

		// Get hash key values
		var hashKeyValues = LM.getHashKeyValues();

		LM.Multi_CurrentField = decodeURIComponent(LM.Multi_GetCurrentField());
		var hashField = "";
		var hashCount = 0;
		var hashPriceValues = LM.Multi_GetHashPriceValues();

		var facetItems = LM.Utils.ElementQuery("[data-role='fsmfacetitem']", LM.Multi_FacetContainer);
		for (var ii = 0; ii < facetItems.length; ii++) {
			var facetItem = facetItems[ii];
			if (facetItem.getAttribute("data-field") != LM.Multi_CurrentField && facetItem.getAttribute("data-checked").toString() != "true") {
				LM.Multi_ToggleFacetItem(facetItem, "enabled", false);
			}
			if (hashKeyValues.indexOf(LM.QueryPrefix + "filter_" + facetItem.getAttribute("data-field") + "=" + facetItem.getAttribute("data-value")) == -1 && hashKeyValues.indexOf(LM.QueryPrefix + "filter_" + encodeURIComponent(facetItem.getAttribute("data-field")) + "=" + encodeURIComponent(facetItem.getAttribute("data-value"))) == -1) {
				LM.Multi_ToggleFacetItem(facetItem, "checked", false);
			}
			else {
				LM.Multi_ToggleFacetItem(facetItem, "checked", true);
				LM.Multi_ToggleFacetItem(facetItem, "enabled", true);
				if (facetItem.getAttribute("data-field") != hashField) {
					hashField = facetItem.getAttribute("data-field");
					hashCount++;
				}
			}
		}

		// If only one facet field selected, enable all options and reset counts
		if (hashField != "" && hashCount == 1 && hashPriceValues == null) {
			var hashFacets = LM.Utils.ElementQuery("[data-role='fsmfacetitem'][data-field='" + hashField + "']", LM.Multi_FacetContainer);
			for (var ii = 0; ii < hashFacets.length; ii++) {
				hashFacets[ii].setAttribute("data-count", hashFacets[ii].getAttribute("data-count-orig"));
				LM.Multi_ToggleFacetItem(hashFacets[ii], "enabled", true);
			}
		}

		// Show individual clear and clear all links if facets selected
		var clearLinks = LM.Utils.ElementQuery("[data-role='fsmfacetclear']", LM.Multi_FacetContainer);
		for (var ii = 0; ii < clearLinks.length; ii++) {
			if (!LM.Multi_FixedPriceFacet && clearLinks[ii].getAttribute("data-field") == LM.Multi_PriceField) {
				if (LM.Multi_PriceSliderMin != null && LM.Multi_PriceSliderMax != null) {
					clearLinks[ii].style.visibility = "visible";
				}
				else {
					clearLinks[ii].style.visibility = "hidden";
				}
			}
			else {
				var checked = LM.Utils.ElementQuery("[data-role='fsmfacetitem'][data-field='" + clearLinks[ii].getAttribute("data-field") + "'][data-checked='true']");
				if (LM.Utils.ElementQuery("[data-role='fsmfacetitem'][data-field='" + clearLinks[ii].getAttribute("data-field") + "'][data-checked='true']").length > 0) {
					clearLinks[ii].style.visibility = "visible";
				}
				else {
					clearLinks[ii].style.visibility = "hidden";
				}
			}
		}

		var clearAllLinks = LM.Utils.ElementQuery("[data-role='fsmfacetclearall']", LM.Multi_FacetContainer);
		var checkedFacets = LM.Utils.ElementQuery("[data-role='fsmfacetitem'][data-checked='true']");
		if (checkedFacets.length > 0 || hashPriceValues != null) {
			for (var ii = 0; ii < clearAllLinks.length; ii++) {
				clearAllLinks[ii].style.visibility = "visible";
			}
		}
		else {
			for (var ii = 0; ii < clearAllLinks.length; ii++) {
				clearAllLinks[ii].style.visibility = "hidden";
			}
		}
	}
});

LM.complete(function () {
	if (!LM.Multi_IsInit) {
		LM.Multi_Init();

		var facetItems = LM.Utils.ElementQuery("[data-role='fsmfacetitem']", LM.Multi_FacetContainer);
		for (var ii = 0; ii < facetItems.length; ii++) {
			var facetItem = facetItems[ii];
			facetItem.setAttribute("data-count-orig", facetItem.getAttribute("data-count"));
		}
	}
	
	// Bind select events
	LM.Multi_BindSelectEvents();

	// Hide loading mask
	if (LM.Multi_LoadingMask != null) {
		LM.Multi_LoadingMask.style.display = "none";
	}

	// Scroll to top
	if (LM.Multi_ScrollToTop && !LM.Multi_IgnoreScroll) {
		var offset = LM.Utils.ElementOffset(LM.Multi_Zone);
		if (LM.Multi_GetScrollTop() > offset.Y) {
			var container = (document.body.scrollTop == 0 ? document.body.parentNode : document.body);
			LM.Multi_AnimateScroll(container, LM.Multi_ScrollTo, LM.Multi_ScrollDuration);
		}
	}
	LM.Multi_IgnoreScroll = false;
});

LM.syncFacets(function (args) {
	// Get facet data and enable facets
	var facets = args["facetData"];
	for (var field in facets) {
		var options = facets[field];
		for (var ii = 0; ii < options.length; ii++) {
			var option = options[ii];
			var count = 0;
			var value = null;
			if (option.length == 2) {
				count = option[0];
				value = option[1];
			}
			else if (option.length == 3) {
				count = option[0];
				value = option[1] + ":" + option[2];
			}
			if (value != null && count > 0) {
				if (field == LM.Multi_PriceField + "_" + LM.Currency) {
					field = LM.Multi_PriceField;
				}
				var facetItem = LM.Utils.ElementQuery("[data-role='fsmfacetitem'][data-field='" + field + "'][data-value='" + value.replace(/'/g, "\\'") + "']", LM.Multi_FacetContainer);
				if (facetItem && facetItem.length > 0) {
					facetItem[0].setAttribute("data-count", count);
					LM.Multi_ToggleFacetItem(facetItem[0], "enabled", true);
				}
			}
		}
	}
});