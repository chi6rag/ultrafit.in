jQuery(document).ready( function($) {

/** ******************************************************************************************** 
	*	Slideshow Myla
	*	marinda.sephton@pod1.com
	*	October 15 2009 - @ London, UK
	**/
	
	$slideshow = {
    context: true,
    tabs: false,
    timeout: 6000,      // time before next slide appears (in ms)
    slideSpeed: 2000,   // time it takes to slide in each slide (in ms)
    tabSpeed: 300,      // time it takes to slide in each slide (in ms) when clicking through tabs
    fx: 'fade',   		// the slide effect options: http://malsup.com/jquery/cycle/browser.html http://malsup.com/jquery/cycle/

    init: function($, context, navContext) {
        // set the context to help speed up selectors/improve performance
        this.context = $(context);
        
        // set tabs to current hard coded navigation items
        this.tabs = $(navContext).find('li');
        
        // remove hard coded navigation items from DOM because they aren't hooked up to jQuery cycle
        this.tabs.remove();
        
        // prepare slideshow and jQuery cycle tabs
        this.prepareSlideshow($);
    },
    
    prepareSlideshow: function($) {
        // initialise the jquery cycle plugin - options: http://malsup.com/jquery/cycle/options.html
        $("div.carousel_images > ul", $slideshow.context).cycle({
            fx: $slideshow.fx,
            timeout: $slideshow.timeout,
            speed: $slideshow.slideSpeed,
            fastOnEvent: $slideshow.tabSpeed,
            pager: $("ul.carousel_nav", $(navContext)),
            pagerAnchorBuilder: $slideshow.prepareTabs,
            before: $slideshow.activateTab,
            pauseOnPagerHover: false,
            pause: false
        });            
    },
    
    prepareTabs: function(i, slide) {
        // return markup from hardcoded tabs for use as jQuery cycle tabs
        return $slideshow.tabs.eq(i); // (attaches necessary jQuery cycle events to tabs)
    },

    activateTab: function(currentSlide, nextSlide) {
        var activeTab = jQuery('a[href="#' + nextSlide.id + '"]', $(navContext)); // get the active tab
        
        // if there is an active tab
        if(activeTab.length) {
            $slideshow.tabs.removeClass('on'); // remove active styling from all other tabs
            activeTab.parent().addClass('on'); // add active styling to active button
        }            
    }            
};

	// set the context to help speed up selectors/improve performance
	var sliderContext = $('.header_carousel');
	var navContext = $('#home_boxes');
	
	if ((sliderContext.length != 0) && (navContext.length != 0)) {
		// add a 'js' class to the slider for progressive enhancement
		$(sliderContext).parent().addClass('js');
		$(navContext).addClass('js');
		// start slideshow
		$slideshow.init($, $(sliderContext), $(navContext));
	}
	
	// stop slideshow - in case needed
	/*if ((sliderContext.length != 0) && ($("div.carousel_images > ul").length != 0)) {
		$("div.carousel_images > ul", $(sliderContext)).cycle('stop');
	}*/

});
