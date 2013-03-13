define([
    // needs to be changed to dojo/request/script at dojo 1.8.4
    // had to use old io/script because of bug in request/script at 1.8.3
    // see: http://bugs.dojotoolkit.org/ticket/16408
    'dojo/io/script',
    'dojo/Deferred',
    'dojo/string'

], function (
    script,
    Deferred,
    string
    ) {
    return {
        // missingParamErrorTxt: String
        missingParamErrorTxt: 'Missing * parameter!',

        // getEnvelopeURL: String
        //      The url to the GetEnvelope service
        //      Contains dojo/string/substitute stuff for placing parameters
        getEnvelopeURL: "http://mapserv.utah.gov/WSUT/FeatureGeometry.svc/GetEnvelope/SGIDQuery/layer(${layerName})where(${fieldName})(=)(${fieldValue})quotes=true",

        getFeatureGeometry: function (layerName, fieldName, fieldValue) {
            // summary:
            //      queries sgid features and returns the envelop
            // layerName: String
            //      The name of the layer in SGID (ie SGID10.TRANSPORTATION.Roads)
            // fieldName: String
            //      The field that you want to query by
            // fieldValue: String
            //      The value that you want to query by
            // returns: Deferred
            console.log('SGIDQuery::getFeatureGeometry', arguments);

            var def;
            var that = this;
            var extent;
            var coords;

            // validate parameters
            function validateParam(param, name) {
                if (!param) {
                    throw that.missingParamErrorTxt.replace('*', name);
                }
            }
            validateParam(layerName, 'layerName');
            validateParam(fieldName, 'fieldName');
            validateParam(fieldValue, 'fieldValue');

            def = new Deferred();

            var args = {
                url: string.substitute(this.getEnvelopeURL, {
                    layerName: layerName, 
                    fieldName: fieldName, 
                    fieldValue: fieldValue
                }),
                jsonp: 'callback'
            };

            script.get(args).then(function (data) {
                if (data.Count > 0) {
                    coords = data.Results[0];
                    extent = new esri.geometry.Extent(coords.MinX, coords.MinY, coords.MaxX, coords.MaxY,
                        new esri.SpatialReference(26912));
                    def.resolve(extent);
                } else {
                    def.reject(data.Message);
                }
            }, function (err) {
                def.reject(err.message);
            });

            return def;
        }
    }; 
});