// tell JSHint to assume existence of these global vars
/*global app, $*/

//  define the global "app" variable containing all Backbone's stuff
window.app = {
    Models: {},
    Collections: {},
    Views: {},
    Routers: {}
};

// kick off the app
$(document).ready(function () {
    'use strict';
    
    // Create the master router.  All navigation is triggered from this
	new app.Routers.Router();
	
    // Trigger the initial route 
	Backbone.history.start({ pushState: false /* turn on/off the HTML5 History API */});
});
