// tell JSHint to assume existence of these global vars
/*global TacocatGalleryReactBackbone, Backbone*/



/**
 * Backbone.js router.
 *
 * Decides what happens when various URLs in the app are hit.
 */
TacocatGalleryReactBackbone.Routers = TacocatGalleryReactBackbone.Routers || {};

(function () {
    'use strict';

    TacocatGalleryReactBackbone.Routers.Router = Backbone.Router.extend({
    
		/**
		 * Define the application's routes.
		 *
		 * This maps a URL 'route' expression to a 
		 * javascript function to call when Backbone
		 * detects a matching URL has been entered
		 * into the browser.location.
		 */
		routes: {
			'v/*path.html': 'viewPhoto',
			'v/*path': 'viewAlbum',
			'*path': 'notFound'
		},
		
		notFound: function () {
			console.log("Backbone route: notFound");
			
			var todos = new Backbone.Collection([
				{ text: 'Dishes!', dueDate: new Date() },
				{ text: 'Fishes!', dueDate: new Date() },
				{ text: 'Wishes!', dueDate: new Date() }
			]);
			
			React.renderComponent(MainLayout({todos:todos}), document.getElementById('root'));
		},
		
		viewAlbum: function() {
			console.log("Backbone route: album");
			
			var album = {
				albumType: "year"
			};
			
			var data = {
				pageType: "album",
				pageSubtype: "album-" + album.albumType,
				album: album
			};
			
			React.renderComponent(MainLayout(data), document.getElementById('root'));
		},
		
		viewPhoto: function() {
			console.log("Backbone route: photo");
			
			var album = {
				albumType: "photo"
			};
			
			var data = {
				pageType: "photo",
				pageSubtype: "album-" + album.albumType,
				album: album
			};		
		
			React.renderComponent(PhotoAlbum(data), document.getElementById('root'));
		}
    });

})();
