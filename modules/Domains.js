// TODO:
//      fallback to local storage if no network connection
define([
    'dojo/Deferred',
    'dojo/dom-construct',
    'dojo/request',
    'dojo/_base/array'
], function (
    Deferred,
    domConstruct,
    request,
    array
) {
    return {
        // _errMsgs: {}
        //      Error messages
        _errMsgs: {
            getCodedValues:
                'There was an error getting the coded values from the Feature Service. Please check your url'
        },

        // responses: Object
        //      holds handles for pending requests and eventually caches the response data
        responses: {},

        populateSelectWithDomainValues: function (select, featureServiceUrl, fieldName) {
            // summary:
            //      populates the given select with domain values and descriptions
            // select: HTML Select Dom Node
            // featureServiceUrl: String
            //      The url to the feature service (i.e. /arcgis/rest/services/ServiceName/FeatureServer/1)
            // fieldName: String
            // returns: dojo/Deferred
            console.log(this.declaredClass + '::populateSelectWithDomainValues', arguments);

            var def = new Deferred();

            domConstruct.empty(select);

            this.getCodedValues(featureServiceUrl, fieldName).then(function (values) {
                this.buildOptions(values, select);
                def.resolve(values);
            }.bind(this), function (error) {
                def.reject(error);
            });

            return def.promise;
        },
        buildOptions: function (values, select) {
            // summary:
            //      description
            // param: type or return: type
            console.log('module/id:buildOptions', arguments);

            // add empty option
            domConstruct.create('option', null, select);
            array.forEach(values, function (v) {
                domConstruct.create('option', {
                    value: v.code,
                    innerHTML: v.name
                }, select);
            });
        },
        getCodedValues: function (featureServiceUrl, fieldName) {
            // summary:
            //      returns a Promise that resolves to an array of the coded values for the feature service
            // featureServiceUrl: String
            //      The url to the feature service (i.e. /arcgis/rest/services/ServiceName/FeatureServer/1)
            // fieldName: String
            // returns: Promise
            console.log(this.declaredClass + '::getCodedValues', arguments);

            var data;
            var fieldData;

            return this.makeRequest(featureServiceUrl).then(function (jsonTxt) {
                data = JSON.parse(jsonTxt);

                array.some(data.fields, function (field) {
                    if (field.name === fieldName) {
                        fieldData = field;
                        return true;
                    } else {
                        return false;
                    }
                });

                return fieldData.domain.codedValues;
            });
        },
        makeRequest: function (featureServiceUrl) {
            // summary:
            //      makes a request to the server for the feature service info
            // featureServiceUrl: String
            console.log('agrc/modules/Domains:makeRequest', arguments);

            var def = new Deferred();

            if (this.responses[featureServiceUrl]) {
                // response is a promise
                return this.responses[featureServiceUrl];
            } else {
                // this is the first time that this request has been attempted
                // actually make the request
                request(featureServiceUrl, {query: {f: 'json'}}).then(
                    function (response) {
                        def.resolve(response);
                    },
                    function (error) {
                        console.error(error);
                        def.reject(this._errMsgs.getCodedValues);
                    }.bind(this)
                );

                return this.responses[featureServiceUrl] = def.promise;
            }
        }
    };
});
