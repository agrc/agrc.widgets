define([
    'dojo/Deferred',
    'dojo/request',
    'dojo/request/script',
    'dojo/_base/declare',
    'dojo/_base/lang'
], function (
    Deferred,
    xhr,
    script,
    declare,
    lang
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
            console.log('agrc/modules/WebAPI:constructor', arguments);

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
            // options.spatialReference: Number
            //      The spatial reference of the input geographic coordinate pair.
            //      Choose any of the wkid's from the Geographic Coordinate System wkid reference
            //      or Projected Coordinate System wkid reference. 26912 is the default.
            // options.tolerance: Number (not implemented)
            // options.spatialRelation: String (default: 'intersect')
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
            console.log('agrc/modules/WebAPI:search', arguments);

            var url = this.baseUrl + 'search/' + featureClass + '/' + encodeURIComponent(returnValues.join(','));

            if (!options) {
                options = {};
            }
            options.apiKey = this.apiKey;
            if (!options.attributeStyle) {
                options.attributeStyle = this.defaultAttributeStyle;
            }

            return this._buildRequest(url, options, 'Error with search request');
        },
        geocode: function (street, zone, options) {
            // summary:
            //      geocode service wrapper (http://api.mapserv.utah.gov/#geocoding)
            // street: String
            //      A Utah street address. eg: 326 east south temple st. Intersections are separated by and.
            // zone: String
            //      A Utah municipality name or 5 digit zip code.
            // options.spatialReference: Number
            //      The spatial reference of the input geographic coordinate pair.
            //      Defaults to 26912.
            // options.format: String (esrijson | geojson)
            //      The format of the resulting address. esri json will easily parse into an esri.Graphic
            //      for display on a map and geojson will easily parse into a feature for use in many open
            //      source projects. If this value is omitted, normal json will be returned.
            // returns: Promise
            console.log('agrc/modules/WebAPI:geocode', arguments);

            var url = this.baseUrl + 'geocode/' + street + '/' + zone;

            if (!options) {
                options = {};
            }
            options.apiKey = this.apiKey;

            return this._buildRequest(url, options, 'Error with geocode request');
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
            // returns: Promise
            console.log('agrc/modules/WebAPI:reverseGeocode', arguments);

            var url = this.baseUrl + 'geocode/reverse/' + x + '/' + y;

            if (!options) {
                options = {};
            }
            options.apiKey = this.apiKey;

            return this._buildRequest(url, options, 'Error with reverse geocode request');
        },
        getRouteMilepost: function (route, milepost, options) {
            // summary:
            //      route milepost wrapper (http://api.mapserv.utah.gov/#geocoding)
            // route: String
            //      The Utah highway number. eg: 15.
            // milepost: String
            //      The highway milepost. eg: 309.001. Milepost precision is up to
            //      1/1000 of a mile (approximately 5 feet).
            // options.side: String (increasing | decreasing)
            //      For divided highways only.. The side of the divided highway to match. Increasing
            //      if you are on the positive side of the divided highway (The mileposts are
            //      getting larger as you drive). Decreasing if you are on the negative side of a
            //      divided highway (the mileposts are getting smaller as you drive). Default is Increasing.
            // options.spatialReference: String
            //      The spatial reference of the input geographic coordinate pair. Choose any of the wkid's
            //      from the Geographic Coordinate System wkid reference or Projected Coordinate System
            //      wkid reference. 26912 is the default.
            // returns: Promise
            console.log('agrc/modules/WebAPI:getRouteMilepost', arguments);

            var url = this.baseUrl + 'geocode/milepost/' + route + '/' + milepost;

            if (!options) {
                options = {};
            }
            options.apiKey = this.apiKey;

            return this._buildRequest(url, options, 'Error with route milepost request');
        },
        _buildRequest: function (url, options, rejectMessage) {
            console.log('agrc/modules/WebAPI:_buildRequest', arguments);

            var def = new Deferred();
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

            return def.promise;
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
