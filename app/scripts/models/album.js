// tell JSHint to assume existence of these global vars
/*global app, $, _, Backbone*/

app.Models = app.Models || {};

(function () {
    'use strict';
    
    /**
	 * Cache of albums retrieved from server.
	 * key = album's path (like 2008/12-31)
	 */
	app.albums = {};
	
	/**
	 * Retrieve an album by path, like '2010/01_31'.
	 *
	 * Album may be in client side cache.
	 *
	 * This is asynchronous -- you have to register a callback via
	 *  .then(), .always(), .done() and .fail()
	 */
	app.getAlbum = function(path) {
		console.log('getAlbum() - path [' + path + ']');

		// build a jQuery Deferred object
		var deferred = $.Deferred();

		// look for album in my cache of albums
		var album = app.albums[path];

		// if album is in cache...
		if (album) {
			console.log('getAlbum() - album [' + path + '] is in cache');

			// resolve the deferred immediately with success
			deferred.resolve(album);
		}
		// else the album is not in cache...  fetch it
		else {
			console.log('getAlbum() - album [' + path + '] not on client, fetching');
			album = new app.Models.Album({fullPath: path});
			album.fetch({
				success: function(model, response, options) {
					//console.log('getAlbum() - success fetching album', path);
					
					// put album in client-side cache
					app.albums[path] = album;
					
					// tell the deferred object to call all done() listeners
					deferred.resolve(album);
				},
				error: function(model, xhr, options) {
					console.log('getAlbum() - error fetching album [' + path + ']: ', xhr, options);

					// tell the deferred object to call all .fail() listeners
					deferred.reject(xhr, options);
				}
			});
		}
		
		// return the jQuery Promise so that the callers can use .then(), .always(), .done() and .fail()
		return deferred.promise();
	};

	/**
	 * Backbone model representing an album.
	 *
	 * Includes all data about child photos.
	 *
	 * Includes enough info about child albums to generate thumbnails, 
	 * but does not include the child album's photos.
	 */
    app.Models.Album = Backbone.Model.extend({

		debug: true,
		
		// The attribute in the model to use as the ID
        idAttribute: 'fullPath',
        
        /**
		 * Standard Backbone function to initialze the model
		 */
        initialize: function() {
        	// use Underscore.js to bind the this variable into all the child functions
        	_.bindAll(this, 'getPhotoByPathComponent', 'getNextPhoto', 'getPrevPhoto', 'getCreationDate', 'getTitle');
        },
        
		/**
		 * Return the URL location of the album's JSON
		 */
		url: function() {
			// if not mock, return real URL
			if (!app.mock) {
				// Album IDs are of this format:
				//   2013
				//   2013/09-08
				//   2013/09-08/someSubAlbum
				var year = this.id.split('/')[0];
				
				// if the year is 2007 or greater, the album's in Gallery2
				if (year >= 2007) {
					return 'http://tacocat.com/pictures/main.php?g2_view=json.Album&album=' + this.id;
				}
				// 2006 and earlier years are in static JSON
				// at /oldpix/year/month-day/album.json
				// such as /oldpix/2001/12-31/album.json
				else {
					return 'http://tacocat.com/oldpix/' + this.id + '/album.json';
				}
			}
			// else if it's a sub album with photos
			else if (this.id.indexOf('/') >= 0) {
				return 'mock/album.json.txt';
			}
			// else it's a year album
			else {
				return 'mock/album-year.json.txt';
			}
		},
        
        /**
		 * Find a photo by it's pathComponent, like 'flowers.jpg'
		 */
		getPhotoByPathComponent: function(pathComponent) {
			//console.log('Album.Model.getPhotoByPathComponent('+pathComponent+'): model: ', jQuery.extend(true, {}, this));
			var photo = _.find(this.attributes.children, function(child) {
				//console.log('album.getPhotoByPathComponent('+pathComponent+'): looking at child.pathComponent: ' + child.pathComponent);
				return child.pathComponent === pathComponent;
			});
	
			return photo;
		},
	
		getNextPhoto: function(pathComponent) {
			//console.log('Album.Model.getNextPhoto('+pathComponent+')');
			var foundCurrentPhoto = false;
			return _.find(this.attributes.children, function(child) {
				//console.log('album.getNextPhoto('+pathComponent+'): looking at child.pathComponent: ' + child.pathComponent);
				if (foundCurrentPhoto) {
					//console.log('album.getNextPhoto('+pathComponent+'): ' + child.pathComponent + ' is the next photo!');
					return true;
				} else if (child.pathComponent === pathComponent) {
					foundCurrentPhoto = true;
				}
			});
		},
	
		getPrevPhoto: function(pathComponent) {
			var prevPhoto;
			_.find(this.attributes.children, function(child) {
				if (child.pathComponent === pathComponent) {
					return true;
				}
				prevPhoto = child;
			});
	
			return prevPhoto;
		},
		
		/**
		 * Return a javascript Date object of this album's creation time.
		 */
		getCreationDate: function() {
			return new Date(this.attributes.creationTimestamp * 1000);
		},
		
		/**
		 * Return the title of this album.
		 */
		getTitle: function() {
			if (this.attributes.albumType === 'week') {
				return this.attributes.title + ', ' + this.getCreationDate().getFullYear();
			}
			else if (this.attributes.albumType === 'year') {
				return this.attributes.title + ' - Dean, Lucie, Felix & Milo Moses';
			}
			return null;
		},

		/**
		 * Standard Backbone function to massage the data returned from the server.
		 */
        parse: function(album, options)  {
            var that = this;
            
            var path = album.pathComponent;
			console.log('Album.parse()', path, album);
				
			//
			// If album doesn't have an ID, it's 2006 or older,
			// and those come from static JSON.  They have a
			// different format and we'll be processing them
			// differently in places.
			//
			var isStaticAlbum = (!album.id);
			
			//	
			// Figure out what type of album it is:  root, year or week
			//
			
			// no path: it's the root album
			if (!path || path.length <= 0) {
				album.albumType = 'root';
			}
			// no slashes:  it's a year album
			else if (path.indexOf('/') < 0) {
				album.albumType = 'year';
			}
			// else it's a subalbum (2005/12-31 or 2005/12-31/snuggery)
			else {
				album.albumType = 'week';
			}
			
			//
			// Set up link to album's parent, needed for the Back button
			//
			
			if (album.albumType === 'root') {
				album.parentpath = null;
			}
			else if (album.albumType === 'week') {
				var pathParts = path.split('/');
				pathParts.pop();
				album.parentpath = pathParts.join('/');
			}
			else if (album.albumType === 'year') {
				album.parentpath = '';
			}
			
			//
			// Set up javascript Date object of this album's creation time
			//
			album.creationDate = new Date(album.creationTimestamp * 1000);
			
			//
			// Set up album's title
			//
			
			// blank out any title on the root album, we don't want to display it
			if (album.albumType === 'root') {
				album.title = undefined;
			}
			// Add a 'fulltitle' attribute accessbile to templating
			if (album.albumType === 'week') {
				album.fulltitle = album.title + ', ' + album.creationDate.getFullYear();
			}
			else if (album.albumType === 'year') {
				album.fulltitle = album.title + ' - Dean, Lucie, Felix & Milo Moses';
			}

			// If the album's caption has any links to the the old
			// picture gallery, rewrite them to point to this UI
			if (album.description) {
				// TODO: copy over from Backbone
				//album.description = app.rewriteGalleryUrls(album.description);
			}
			
			// If album doesn't have URL, it's a pre 2007 album.
			// Give it URL of same structure as post 2006 albums.
			if (!album.url) {
				// like v/2013 or v/2013/12-31/
				album.url = 'v/' + album.pathComponent;
			}
								
			//
			// If album is a year album...
			//
			if (album.albumType === 'year') {
			
				// Set up the sidebar 
				// Years to 2006 have a pregenerated album.sidebar containing HTML.  Leave it.
				// Years from 2007 have firsts, which we generate album.sidebar from here
				if (!album.sidebar) {
					//album.firstItems = that.Firsts.getFirstsForYear(album.title);
					if (!album.firstItems) {
						console.log("Year [" + album.title + "] doesn't have firsts in cache");
					}
				}
			
				// If the album is a pre 2007 year, do some munging on its thumbnails
				if (isStaticAlbum) {
				
					// Each child is thumbnail of a week album
					_.each(album.children, function(entry, key) {
														
						// Generate url to album.
						// Give url same structure as post 2006 albums
						if (!entry.url) {
							// like v/2013/12-31/
							entry.url = 'v/' + entry.pathComponent;
						}
	
						// Generate thumbnail image info.
						// Thumb will use full-sized image sent through an 
						// image proxy service (this is temporary, need a more
						// performant solution like hooking up to a CDN)
						if (!entry.thumbnail) {
							var url = null;
	
							if (entry.fullSizeImage.url) {
								url = 'http://images.weserv.nl/?w=100&h=100&t=square&url=';
								url = url + entry.fullSizeImage.url.replace('http://', '');
							}
							else {
								console.log("warning: no thumb image found for album " + path);
							}
							entry.thumbnail = {
								url: url,
								height: 100,
								width: 100
							};
						}
					});
				}
				
				// Group the child week albums of the year album by month
				var childAlbumsByMonth = _.groupBy(album.children, function(child) {
					// create Date object based on album's timestamp
					// multiply by 1000 to turn seconds into milliseconds
					return new Date(child.creationTimestamp * 1000).getMonth();
				});

				// Put in reverse chronological array
				var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
				album.childAlbumsByMonth = [];
				for (var i = 11; i >= 0; i--) {
					if (childAlbumsByMonth[i]) {
						var month = {
							monthName: monthNames[i],
							albums: childAlbumsByMonth[i]
						};
						album.childAlbumsByMonth.push(month);
					}
				}
								
				console.log("childAlbumsByMonth", album.childAlbumsByMonth);
			}
						
			//
			// Do some munging on the album's photos
			//
			if (album.albumType === 'week') {
				
				// Pre 2007 albums store photos in an associative array instead 
				// of a regular array.  Photo order is in the .childrenOrder array.
				// Move .children to .photosByPhotoName and make a correctly ordered
				// array at .children.
				if (album.childrenOrder) {
					album.photosByPhotoName = album.children;
					album.children = [];
					_.each(album.childrenOrder, function(childName) {
						var photo = album.photosByPhotoName[childName];
						album.children.push(photo);
					});
				}
			
				//
				// process each album photo
				//
				_.each(album.children, function(entry, key) {
															    
					// If the caption contains any <a hrefs> that link to a gallery
					// URL, rewrite them to point to this UI instead.
					// TODO: copy over from Backbone
					//entry.description = app.rewriteGalleryUrls(entry.description);
					
					// If I don't have URL to full sized image, I'm a post 2006 album.
					// Generate now
					if (!entry.fullSizeImage) {
						entry.fullSizeImage = {
							// http://tacocat.com/pictures/d/{{id}}-3/{{pathComponent}}
							url: 'http://tacocat.com/pictures/d/' + entry.id + '-3/' + entry.pathComponent
						};
					}
					
					// If I don't have a URL to my photo page, I'm a pre 2007 album.
					// Set up URL here of same format as post 2006 albums: v/2009/11-08/supper.jpg.html
					if (!entry.url) {
						entry.url = 'v/' + album.pathComponent + '/' + entry.pathComponent + '.html';
					}
				
					// If I don't have a thumbnail URL, I'm a pre 2007 album.
					// Generate a thumb using my full-sized image using an 
					// image proxy service (this is temporary, need a more
					// performant solution like hooking up to a CDN)
					if (!entry.thumbnail) {
						var url = 'http://images.weserv.nl/?w=100&h=100&t=square&url=';
						url = url + entry.fullSizeImage.url.replace('http://', '');
						entry.thumbnail = {
							url: url,
							height: 100,
							width: 100
						};
					}
				});
			}
			
			return album;
        }
    });

})();


