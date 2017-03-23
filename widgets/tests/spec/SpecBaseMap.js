require([
    'agrc/widgets/map/BaseMap',

    'dijit/registry',

    'dojo/aspect',
    'dojo/dom-construct',
    'dojo/hash',
    'dojo/query',
    'dojo/_base/lang',

    'esri/geometry/Extent'
], function (
    BaseMap,

    dijitRegistry,

    aspect,
    domConstruct,
    hash,
    query,
    lang,

    Extent
) {
    describe('agrc/widgets/map/BaseMap', function () {
        var map;
        var testDiv;
        beforeEach(function () {
            testDiv = domConstruct.create('div', {
                width: '300px',
                height: '300px'
            }, document.body);
        });

        afterEach(function () {
            map.destroy();
            domConstruct.destroy(testDiv);
            map = null;
        });

        describe('BaseMap - Default Options', function () {
            beforeEach(function () {
                map = new BaseMap(testDiv, {
                    quadWord: 'test'
                });
            });

            it('should set the initial extent and spatial reference', function () {
                map = new BaseMap(testDiv, {
                    useDefaultBaseMap: false
                });
                var expectedExtent = new Extent({
                    xmax: -11762120.612131765,
                    xmin: -13074391.513731329,
                    ymax: 5225035.106177688,
                    ymin: 4373832.359194187,
                    spatialReference: {
                        wkid: 3857
                    }
                });

                expect(map.extent.spatialReference.wkid).toEqual(expectedExtent.spatialReference.wkid);
                expect(map.extent.contains(expectedExtent)).toBeTruthy();
            });

            it('should add the Vector Cache map service', function () {
                expect(map.layerIds.length).toEqual(1);

                var lyrId = map.layerIds[0];
                var lyr = map.getLayer(lyrId);
                expect(lyr.url).toMatch(/discover\.agrc\.utah\.gov/);
            });
        });

        describe('BaseMap - Non-default Options', function () {
            it('should mixin options', function () {
                var params = {
                    useDefaultExtent: false,
                    quadWord: 'test'
                };

                map = new BaseMap(testDiv, params);

                expect(map.useDefaultExtent).toBeFalsy();
            });

            describe('Full Extent Button', function () {
                var testButton;

                beforeEach(function () {
                    map = new BaseMap(testDiv, {
                        includeFullExtentButton: true,
                        quadWord: 'test'
                    });

                    testButton = query('.glyphicon-globe', testDiv)[0];
                });

                it('should add the full extent button when specified in the options', function () {
                    expect(testButton).toBeDefined();
                });

                it('should zoom back out to the full extent when the button is pressed', function (done) {
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
                map = new BaseMap(testDiv, {
                    router: true,
                    quadWord: 'test'
                });

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

                expect(map.initRouter().scale).toBe(3);
                expect(map.initRouter().center.x).toEqual(1);
                expect(map.initRouter().center.y).toEqual(2);
            });
            it('doesn\'t update hash if NaN coords', function () {
                map.extent.getCenter.and.returnValue({
                    x: NaN,
                    y: NaN
                });

                expect(map.updateExtentHash()).toBeUndefined();
            });
            it('doesn\'t pass NaN', function () {
                expect(map.initRouter()).toEqual({});
            });
        });
    });
});
