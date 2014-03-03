/*global TacocatGalleryReactBackbone, $*/


window.TacocatGalleryReactBackbone = {
    Models: {},
    Collections: {},
    Views: {},
    Routers: {},
    
    init: function () {
        'use strict';
        console.log('Hello from Backbone!');
        
        // Create the master router.  All navigation is triggered from this
		new TacocatGalleryReactBackbone.Routers.Router();
		
        // Trigger the initial route 
		Backbone.history.start({ pushState: false /* turn on/off the HTML5 History API */});
    }
};

$(document).ready(function () {
    'use strict';
    TacocatGalleryReactBackbone.init();
});
