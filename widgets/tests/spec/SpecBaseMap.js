require([
    'agrc/widgets/map/BaseMap',
    'dojo/dom-construct',
    'dojo/_base/window',
    'agrc/modules/EsriLoader!esri/geometry/Extent',
    'dijit/registry',
    'dojo/_base/lang'
],

function (
    BaseMap,
    domConstruct,
    win,
    Extent,
    dijitRegistry,
    lang
    ) {
    describe('agrc/widgets/map/BaseMap', function () {
        var map;
        var testDiv;
        beforeEach(function(){
            testDiv = domConstruct.create("div", {
                width: "300px",
                height: "300px"
            }, win.body());
        });

        afterEach( function() {
            map.destroy();
            domConstruct.destroy(testDiv);
            map = null;
        });

        describe("BaseMap - Default Options", function() {
            beforeEach( function() {
                map = new BaseMap(testDiv);

                waitsFor( function() {
                    return map.loaded;
                }, "map to load", 5000);
            });

            it("should set the initial extent and spatial reference", function() {
                var expectedExtent = new Extent({
                    xmin: 121350,
                    ymin: 4002431,
                    xmax: 770096,
                    ymax: 4745283,
                    spatialReference: {
                        wkid: 26912
                    }
                });

                expect(map.spatialReference.wkid).toEqual(expectedExtent.spatialReference.wkid);
                expect(map.extent.contains(expectedExtent)).toBeTruthy();
            });

            it("should add the Vector Cache map service", function() {
                expect(map.layerIds.length).toEqual(1);

                var lyrId = map.layerIds[0];
                var lyr = map.getLayer(lyrId);
                expect(lyr.url).toEqual("http://mapserv.utah.gov/ArcGIS/rest/services/BaseMaps/Vector/MapServer");
            });
        });

        describe("BaseMap - Non-default Options", function() {
            it("should mixin options", function() {
                var params = {
                    useDefaultExtent: false,
                    defaultBaseMap: 'UtahBaseMap-Terrain'
                };

                map = new BaseMap(testDiv, params);

                expect(map.useDefaultExtent).toBeFalsy();
                expect(map.defaultBaseMap).toEqual("UtahBaseMap-Terrain");
            });

            describe('Full Extent Button', function() {
                var testButton;

                beforeEach( function() {
                    map = new BaseMap(testDiv, {
                        includeFullExtentButton: true
                    });

                    waitsFor( function() {
                        testButton = dijitRegistry.byId(map.id + '_full-extent-button');
                        return testButton;
                    }, "testButton to be created", 5000);
                });

                it('should add the full extent button when specified in the options', function() {
                    expect(testButton).toBeDefined();
                });

                it('should zoom back out to the full extent when the button is pressed', function() {
                    var fullExtent;
                    var buttonClicked = false;

                    runs(function () {
                        fullExtent = lang.clone(map.extent);
                        map.panDown().then(function () {
                            testButton.onClick();
                            buttonClicked = true;
                        });
                    });

                    waitsFor(function () {
                        return buttonClicked;
                    });

                    waitsFor(function () {
                        return Math.round(map.extent.ymin) === Math.round(fullExtent.ymin);
                    }, 'map to be set to full extent', 2000);
                });
            });
        });
    });
});