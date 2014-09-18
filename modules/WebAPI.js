define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/request',
    'dojo/request/script',
    'dojo/Deferred'

], function(
    declare,
    lang,
    xhr,
    script,
    Deferred
) {
    return declare(null, {
        // description:
        //      A convenience class for using [AGRC's web api](http://api.mapserv.utah.gov).

        // baseUrl: String
        baseUrl: '//api.mapserv.utah.gov/api/v1/',

        // defaultAttributeStyle: String
        defaultAttributeStyle: 'identical',

        // xhrProvider: dojo/request/* provider
        //      The current provider as determined by the search function
        xhrProvider: null,


        // Properties to be sent into constructor

        // apiKey: String
        //      web api key (http://developer.mapserv.utah.gov/AccountAccess)
        apiKey: null,


        constructor: function (params) {
            // summary:
            //      description
            // params: {}
            console.log('agrc/modules/WebAPI::constructor', arguments);

            lang.mixin(this, params);
        },
        search: function (featureClass, returnValues, options) {
            // summary:
            //      search service wrapper (http://api.mapserv.utah.gov/#search)
            // featureClass: String
            //      Fully qualified feature class name eg: SGID10.Boundaries.Counties
            // returnValues: String[]
            //      A list of attributes to return eg: ['NAME', 'FIPS'].
            //      To include the geometry use the shape@ token or if you want the
            //      envelope use the shape@envelope token.
            // options.predicate: String
            //      Search criteria for finding specific features in featureClass.
            //      Any valid ArcObjects where clause will work. If omitted, a TSQL *
            //      will be used instead. eg: NAME LIKE 'K%'
            // options.geometry: String (not fully implemented)
            //      The point geometry used for spatial queries. Points are denoted as
            //      'point:[x,y]'.
            // options.spatialReference: String (not implemented)
            // options.tolerance: Number (not implemented)
            // options.spatialRelation: String (default: 'intersect') (not fully implemented)
            // options.buffer: Number
            //      A distance in meters to buffer the input geometry.
            //      2000 meters is the maximum buffer.
            // options.pageSize: Number (not implemented)
            // options.skip: Number (not implemented)
            // options.attributeStyle: String (defaults to 'identical')
            //      Controls the casing of the attributes that are returned.
            //      Options:
            //
            //      'identical': as is in data.
            //      'upper': upper cases all attribute names.
            //      'lower': lowercases all attribute names.
            //      'camel': camel cases all attribute names
            //
            // returns: Promise
            console.log('agrc/modules/WebAPI::search', arguments);

            var def = new Deferred();
            var url = this.baseUrl + 'search/' + featureClass + '/' + encodeURIComponent(returnValues.join(','));

            if (!options) {
                options = {};
            }
            options.apiKey = this.apiKey;
            if (!options.attributeStyle) {
                options.attributeStyle = this.defaultAttributeStyle;
            }

            this._buildRequest(url, options, def, 'Error with search request');

            return def.promise;
        },
        reverseGeocode: function (x, y, options) {
            // summary:
            //      reverse geocode service wrapper (http://api.mapserv.utah.gov/#geocoding)
            // x: Number
            //      An x coordinate.
            // y: Number
            //      A y coordinate.
            // options.spatialReference: Number
            //      The spatial reference of the input geographic coordinate pair.
            //      Defaults to 26912.
            // options.distance: Number
            //      Sets the distance in meters from the geographic coordinate to find a street address.
            //      Default is 5 meters.
            // options.callback: String (not fully implemented)
            //      The callback function to call for cross domain javascript calls (jsonp).
            console.log('agrc/modules/WebAPI::reverseGeocode', arguments);

            var def = new Deferred();
            var url = this.baseUrl + 'geocode/reverse/' + x + '/' + y;

            this._buildRequest(url, options, def, 'Error with geocode request');

            return def.promise;
        },
        _buildRequest: function (url, options, def, rejectMessage) {
            // summary:
            //      description
            // params
            console.log('agrc/modules/WebAPI::_buildRequest', arguments);

            var params = {
                query: options,
                handleAs: 'json',
                headers: {
                    // remove the pre-flight request which breaks the request
                    // ref: http://www.sitepen.com/blog/2014/01/15/faq-cors-with-dojo/
                    'X-Requested-With': null
                },
                // required for JSONP requests and doesn't hurt CORS requests
                jsonp: 'callback'
            };

            if (!this.xhrProvider) {
                this.xhrProvider = (this.supportsCORS()) ? xhr : script;
            }

            this.xhrProvider(url, params).then(function (response) {
                if (response.status === 200) {
                    def.resolve(response.result);
                } else {
                    def.reject(response.message);
                }
            }, function (err) {
                if (err.message) {
                    def.reject(err.message);
                } else {
                    def.reject(rejectMessage);
                }
            });
        },
        supportsCORS: function () {
            // summary:
            //      Tests for CORS support. Code is from Modernizer
            // returns: Boolean
            console.log('agrc/modules/WebAPI:supportsCORS', arguments);

            return 'XMLHttpRequest' in window && 'withCredentials' in new XMLHttpRequest();
        }
    });
});
