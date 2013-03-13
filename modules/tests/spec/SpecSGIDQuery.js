require([
    'agrc/modules/SGIDQuery',
    'dojo/Deferred'

],

function (
    SGIDQuery,
    Deferred
    ) {
    describe('agrc/modules/SGIDQuery', function () {
        it('creates a valid object', function () {
            expect(SGIDQuery).toEqual(jasmine.any(Object));
        });
    });
    describe('getFeatureGeometry', function () {
        it("returns a deferred", function () {
            var returned = SGIDQuery.getFeatureGeometry('blah', 'blah', 'blah');
            expect(returned).toEqual(jasmine.any(Deferred));
        });
        it("throws errors if missing any required parameters", function () {
            var noParams = function () {
                SGIDQuery.getFeatureGeometry();
            };
            var onlyLayerName = function () {
                SGIDQuery.getFeatureGeometry('blah');
            };
            var missingFieldValue = function () {
                SGIDQuery.getFeatureGeometry('blah', 'blah');
            };

            expect(noParams).toThrow(SGIDQuery.missingParamErrorTxt.replace('*', 'layerName'));
            expect(onlyLayerName).toThrow(SGIDQuery.missingParamErrorTxt.replace('*', 'fieldName'));
            expect(missingFieldValue).toThrow(SGIDQuery.missingParamErrorTxt.replace('*', 'fieldValue'));            
        });
        // it("calls script with the appropriate parameters", function () {
            // can't do this because I can't stub modules in esri jsapi 
        // });
        it("successfully returns geometry", function () {
            var returnData;
            var def;
            runs(function () {
                def = SGIDQuery.getFeatureGeometry('SGID10.BOUNDARIES.Counties', 'NAME', 'KANE');
                def.then(function (data) {
                    returnData = data;
                });
            });
            waitsFor(function () {
                return def.isFulfilled();
            }, 'def to be resolved', 5000);
            runs(function () {
                expect(returnData.xmax).toEqual(jasmine.any(Number));
            });
        });
        it("successfully returns error", function () {
            var returnData;
            var def;
            runs(function () {
                def = SGIDQuery.getFeatureGeometry('SGID10.BOUNDARIES.Counties', 'NAME', 'KANEd');
                def.then(function (data) {
                    returnData = data;
                }, function (err) {
                    returnData = err;
                });
            });
            waitsFor(function () {
                return def.isFulfilled();
            }, 'def to be resolved', 5000);
            runs(function () {
                expect(returnData).toEqual('Error|Feature not found.');
            });
        });
    });
});