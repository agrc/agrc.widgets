// TODO:
//      fallback to local storage if no network connection
//      do not submit more than one request to the server at a time
define([
    'dojo/dom-construct',
    'dojo/Deferred',
    'dojo/request',
    'dojo/_base/array'

], function (
    domConstruct,
    Deferred,
    request,
    array
    ) {
    return {
        // _errMsgs: {}
        //      Error messages
        _errMsgs: {
            getCodedValues: 'There was an error getting the coded values from the Feature Service. Please check your url'
        },

        populateSelectWithDomainValues: function (select, featureServiceUrl, fieldName) {
            // summary:
            //      populates the given select with domain values and descriptions
            // select: HTML Select Dom Node
            // featureServiceUrl: String
            //      The url to the feature service (i.e. /arcgis/rest/services/ServiceName/FeatureServer/1)
            // fieldName: String
            // returns: dojo/Deferred
            console.log(this.declaredClass + "::populateSelectWithDomainValues", arguments);

            var def = new Deferred();
            var namespace = 'agrc/modules/Domains_codedValues';
            var prop = featureServiceUrl + '_' + fieldName;
            if (!window.AGRC) {
                window.AGRC = {};
            }
            if (!window.AGRC[namespace]) {
                window.AGRC[namespace] = {};
            }

            var buildOptions = function (values) {
                // add empty option
                domConstruct.create('option', null, select);
                array.forEach(values, function (v) {
                    domConstruct.create('option', {
                        value: v.code,
                        innerHTML: v.name
                    }, select);
                });
            };

            domConstruct.empty(select);

            if (window.AGRC[namespace][prop]) {
                buildOptions(window.AGRC[namespace][prop]);
                def.resolve(window.AGRC[namespace][prop]);
            } else {
                this.getCodedValues(featureServiceUrl, fieldName).then(function (values) {
                    window.AGRC[namespace][prop] = values;

                    buildOptions(values);
                    def.resolve(values);
                }, function (error) {
                    def.reject(error);
                });
            }

            return def;
        },
        getCodedValues: function (featureServiceUrl, fieldName) {
            // summary:
            //      returns an array of the coded values for the feature service
            // featureServiceUrl: String
            //      The url to the feature service (i.e. /arcgis/rest/services/ServiceName/FeatureServer/1)
            // fieldName: String
            // returns: dojo/Deferred
            console.log(this.declaredClass + "::getCodedValues", arguments);
        
            var def = new Deferred();
            var that = this;
            var data;
            var fieldData;

            function getValues(jsonTxt) {
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
            }

            request(featureServiceUrl + '?f=json').then(
                function (response) {
                    def.resolve(getValues(response));
                }, function (error) {
                    console.error(error);
                    def.reject(that._errMsgs.getCodedValues);
                }
            );

            return def;
        }
    };
});