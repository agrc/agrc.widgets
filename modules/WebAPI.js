define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/request',
    'dojo/Deferred'

], function(
    declare,
    lang,
    request,
    Deferred
) {
    return declare(null, {
        // description:
        //      A convenience class for using [AGRC's web api](http://api.mapserv.utah.gov).

        // baseUrl: String
        baseUrl: 'http://api.mapserv.utah.gov/api/v1/',


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
            //      A comma separated string of attributes to return eg: NAME,FIPS. 
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
            // pageSize: Number (not implemented)
            // skip: Number (not implemented)
            //
            // returns: Promise
            console.log('agrc/modules/WebAPI::search', arguments);
        
            var def = new Deferred();
            var url = this.baseUrl + 'search/' + featureClass + '/' + returnValues.join(',');

            if (!options) {
                options = {};
            }
            options.apiKey = this.apiKey;
            var params = {
                query: options,
                handleAs: 'json',
                headers: {
                    'X-Requested-With': null
                }
            };

            request(url, params).then(function (response) {
                if (response.status === 200) {
                    def.resolve(response.result);
                } else {
                    def.reject(response.message);
                }
            }, function (err) {
                if (err.message) {
                    def.reject(err.message);
                } else {
                    def.reject('Error with search request');
                }
            });

            return def.promise;
        }
    });
});