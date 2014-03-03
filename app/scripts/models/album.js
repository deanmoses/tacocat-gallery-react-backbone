/*global TacocatGalleryReactBackbone, Backbone*/

TacocatGalleryReactBackbone.Models = TacocatGalleryReactBackbone.Models || {};

(function () {
    'use strict';

    TacocatGalleryReactBackbone.Models.Album = Backbone.Model.extend({

        url: '',

        initialize: function() {
        },

        defaults: {
        },

        validate: function(attrs, options) {
        },

        parse: function(response, options)  {
            return response;
        }
    });

})();
