require([
    'dojo/_base/lang',
    'dojo/_base/window',
    'dojo/dom-construct',
    'dojo/aspect',
    'dojo/hash',

    'dijit/registry',

    'agrc/widgets/map/BaseMap',

    'esri/geometry/Extent'
],

function (
    lang,
    win,
    domConstruct,
    aspect,
    hash,

    dijitRegistry,

    BaseMap,

    Extent
    ) {
    describe('agrc/widgets/map/BaseMap', function () {
        var map;
        var testDiv;
        beforeEach(function(){
            testDiv = domConstruct.create('div', {
                width: '300px',
                height: '300px'
            }, win.body());
        });

        afterEach( function() {
            map.destroy();
            domConstruct.destroy(testDiv);
            map = null;
        });

        describe('BaseMap - Default Options', function() {
            beforeEach( function(done) {
                map = new BaseMap(testDiv);

                map.on('load', done);
            });

            it('should set the initial extent and spatial reference', function() {
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

            it('should add the Vector Cache map service', function() {
                expect(map.layerIds.length).toEqual(1);

                var lyrId = map.layerIds[0];
                var lyr = map.getLayer(lyrId);
                expect(lyr.url).toEqual(
                    window.location.protocol +
                    '//mapserv.utah.gov/ArcGIS/rest/services/BaseMaps/Vector/MapServer');
            });
        });

        describe('BaseMap - Non-default Options', function() {
            it('should mixin options', function() {
                var params = {
                    useDefaultExtent: false,
                    defaultBaseMap: 'UtahBaseMap-Terrain'
                };

                map = new BaseMap(testDiv, params);

                expect(map.useDefaultExtent).toBeFalsy();
                expect(map.defaultBaseMap).toEqual('UtahBaseMap-Terrain');
            });

            describe('Full Extent Button', function() {
                var testButton;

                beforeEach( function(done) {
                    map = new BaseMap(testDiv, {
                        includeFullExtentButton: true
                    });

                    aspect.after(map, 'onLoad', function() {
                        setTimeout(function () {
                            testButton = dijitRegistry.byId(map.id + '_full-extent-button');
                            done();
                        }, 1500);
                    });
                });

                it('should add the full extent button when specified in the options', function() {
                    expect(testButton).toBeDefined();
                });

                it('should zoom back out to the full extent when the button is pressed', function(done) {
                    var fullExtent;

                    fullExtent = lang.clone(map.extent);
                    map.panDown().then(function () {
                        map.setDefaultExtent().then(function () {
                            expect(Math.round(map.extent.ymin)).toEqual(Math.round(fullExtent.ymin));
                            done();
                        });
                    });
                });
            });
        });
        describe('router', function () {
            var x = 1.3;
            var y = 2;
            var scale = 3.3;
            var expectedHash = 'x=1&y=' + y + '&scale=3';

            beforeEach(function () {
                map = new BaseMap(testDiv, {router: true});

                spyOn(map.extent, 'getCenter').and.returnValue({x: x, y: y});
                spyOn(map, 'getScale').and.returnValue(scale);
            });
            afterEach(function () {
                hash('');
            });
            it('sets the correct hash', function () {
                expect(map.updateExtentHash()).toEqual(expectedHash);
            });
            it('doesn\'t overwrite any existing hashes', function () {
                hash('test=param', true);

                expect(map.updateExtentHash()).toEqual('test=param&' + expectedHash);
            });
            it('doesn\'t duplicate routes', function () {
                expect(map.updateExtentHash()).toEqual(expectedHash);
                expect(map.updateExtentHash()).toEqual(expectedHash);

                hash('test=param', true);

                expect(map.updateExtentHash()).toEqual('test=param&' + expectedHash);
                expect(map.updateExtentHash()).toEqual('test=param&' + expectedHash);
            });
            it('updates the extent on init if it exists', function () {
                hash(expectedHash);

                spyOn(map, 'centerAt');
                spyOn(map, 'setScale');

                map.initRouter();

                expect(map.centerAt).toHaveBeenCalledWith(jasmine.objectContaining({
                    x: '1',
                    y: '2'
                }));
                expect(map.setScale).toHaveBeenCalledWith('3');
            });
        });
    });
});