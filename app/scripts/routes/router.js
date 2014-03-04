// tell JSHint to assume existence of these global vars
/*global app, Backbone*/


/**
 * Backbone.js router.
 *
 * Decides what happens when various URLs in the app are hit.
 */
app.Routers = app.Routers || {};

(function () {
    'use strict';

    app.Routers.Router = Backbone.Router.extend({
    
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
		
		/**
		 * Show an album page
		 */
		viewAlbum: function(path) {
			var _this = this;
			this.wait();
			
			// regularize path by getting rid of any preceding or trailing slashes
			path = this.normalizePath(path);
			
			console.log("Router.viewAlbum - path:", path);
						
			// fetch album, either from cache or from server
			app.getAlbum(path)
			.fail(function(xhr, options) {
				console.log('Error retrieving album [' + path + ']. Error: ', xhr, options);
			})
			.done(function(album) {
				console.log('Router.viewAlbum() - path [', path, '] album:', album);
				var data = {
					pageType: "album",
					album: album
				};
				var component = _this.getAlbumComponent(album.attributes.albumType, data);
				React.renderComponent(component, _this.getRootElement());
			})
			.always(function(){
				_this.unwait();
			});
		},
		
		getAlbumComponent: function(albumType, data) {
			switch(albumType) {
				case 'root': return RootAlbumPage(data);
				case 'week': return WeekAlbumPage(data);
				case 'year': return YearAlbumPage(data);
				default: throw 'Unrecognized album type: [' + albumType + ']';
			}
		},
		
		/**
		 * Show a photo page
		 */
		viewPhoto: function() {
			var _this = this;
			this.wait();
			
			var pathParts = path.split('/');
			var photoId = pathParts.pop();
			var albumPath = pathParts.join('/');
			
			console.log('Router.viewPhoto: ' + photoId + ' in album ' + albumPath);
		
			// fetch the album, either from cache or from server
			app.getAlbum(albumPath)
				.fail(function(xhr, options) {
					console('Router.viewPhoto() couldn\'t find album ' + path + '. Error: ', xhr, options);
				})
				.done(function(album) {
					//console.log('Router.viewPhoto() got album ' + albumPath + ' for photo ' + photoId + '.  Album: ' , album);
			
					var photo = album.getPhotoByPathComponent(photoId);
					if (!photo) {
						throw 'No photo with ID ' + photoId;
					}
					console.log('Router.viewPhoto() got photo ' + photoId, photo);
					
					// set the photo's album on the photo so the view can use that info
					photo.album = album.attributes;
					photo.nextPhoto = album.getNextPhoto(photoId);
					photo.prevPhoto = album.getPrevPhoto(photoId);
					photo.orientation = (photo.height > photo.width) ? 'portrait' : 'landscape';
					
					var data = {
						pageType: "photo",
						photo: photo,
						album: album
					};		
				
					React.renderComponent(PhotoAlbum(data), _this.getRootElement());
				})
				.always(function(){
					_this.unwait();
				});
		},
		
		/**
		 * Unrecognized URL
		 */
		notFound: function (path) {
			console.log("Backbone route: notFound, path: ", path);
			
			// retrieve the root album
			this.viewAlbum('');
		},

		/**
		 * Helper method to normalize paths by removing preceding or trailing slashes
		 */
		normalizePath: function(path) {
			if (!path) {
				return '';
			}
			
			// strip any trailing slash
			path = path.replace(/\/$/, '');
	
			// Regularize path by getting rid of any preceding or trailing slashes
			var pathParts = path.split('/');
			return pathParts.join('/');
		},
		
		/**
		 * Helper method to get the root element that all views / pages are displayed in
		 */
		getRootElement: function() {
			return document.getElementById('root');
		},
		 
		 /**
		  * Put the UI in 'waiting' state, appropriate for when it's fetching data.
		  */
		wait: function() {
			$('#waiting').addClass('on');
		},
		
		unwait: function() {
			$('#waiting').removeClass('on');
		},
    });

})();
