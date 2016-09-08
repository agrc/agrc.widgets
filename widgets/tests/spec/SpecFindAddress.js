require([
    'agrc/widgets/locate/FindAddress',
    'dojo/dom-construct',
    'dojo/_base/window',
    'dojo/Deferred',
    'dojo/dom-style',
    'esri/SpatialReference',
    'esri/geometry/Extent',
    'esri/geometry/Point',
    'dojo/query',
    'dojo/dom-class'

], function (
    FindAddress,
    domConstruct,
    win,
    Deferred,
    domStyle,
    SpatialReference,
    Extent,
    Point,
    query,
    domClass
) {
    var widget;
    var address = '123 S Main St';
    var zip = '84101';
    var result = {
        'result': {
            'location': {
                'x': 424808.49945603119,
                'y': 4513232.5811240105
            },
            'score': 100.0,
            'locator': 'Centerlines.StatewideRoads',
            'matchAddress': '123 S MAIN ST, 84101',
            'inputAddress': '123 S Main St, 84101'
        },
        'status': 200
    };

    afterEach(function () {
        if (widget) {
            widget.destroy();
            widget = null;
        }
    });

    describe('agrc/widgets/locate/FindAddress', function () {
        describe('Without Map', function () {
            beforeEach(function () {
                widget = new FindAddress(null, domConstruct.create('div', null, win.body()));
            });
            it('should not create a default symbol if no map was provided', function () {
                expect(widget.symbol).toBeNull();
            });

            it('should not assign a graphics layer if no map was provided', function () {
                expect(widget.graphicsLayer).toBeNull();
            });

            it('should validate when there is data in textboxes', function () {
                widget.txtAddress.value = 'x';
                widget.txtZone.value = 'x';

                expect(widget._validate()).toBeTruthy();
            });

            it('should not validate when there is not data in textboxes', function () {
                widget.txtAddress.value = 'x';

                expect(widget._validate()).toBeFalsy();
            });

            it('should successfully find a valid address', function () {
                widget.txtAddress.value = address;
                widget.txtZone.value = zip;

                //fake that error has already happened
                domClass.add(widget.errorMsg.parentElement, 'has-error');

                spyOn(widget, '_invokeWebService').and.callFake(function () {
                    var d = new Deferred();
                    d.resolve(result);

                    return d;
                });

                spyOn(widget, '_onFind').and.callThrough();
                spyOn(widget, 'onFind').and.callThrough();
                spyOn(widget, '_onError').and.callThrough();

                widget.geocodeAddress();

                expect(widget._invokeWebService).toHaveBeenCalledWith({
                    street: address,
                    zone: zip
                });

                expect(widget._onFind).toHaveBeenCalled();
                expect(widget._onFind).toHaveBeenCalledWith(result);

                expect(widget.onFind).toHaveBeenCalled();

                expect(widget._onError).not.toHaveBeenCalled();

                expect(domClass.contains(widget.errorMsg.parentElement, 'has-error')).toBeFalsy();
            });

            it('should display a not found message for a nonvalid address', function () {
                widget.txtAddress.value = 'x';
                widget.txtZone.value = 'x';

                spyOn(widget, '_invokeWebService').and.callFake(function () {
                    var d = new Deferred();
                    d.reject({});

                    return d;
                });

                spyOn(widget, '_onFind').and.callThrough();
                spyOn(widget, '_onError').and.callThrough();

                widget.geocodeAddress();

                expect(widget._onError).toHaveBeenCalled();
                expect(widget._onFind).not.toHaveBeenCalled();

                expect(domStyle.get(widget.errorMsg, 'display')).toEqual('inline');
            });

            it('should use spatialReference ctor param first', function () {
                widget = new FindAddress({
                    wkid: 3857
                }).placeAt(win.body());

                expect(widget.wkid).toEqual(3857);
            });

            it('should use default spatialReference value if not supplied', function () {
                expect(widget.wkid).toEqual(26912);
            });
        });

        describe('With Map', function () {
            var map;

            beforeEach(function () {
                map = {
                    graphicsLayer: {
                        id: 'default',
                        clear: function () {},
                        add: function () {}
                    },
                    getLevel: function () {
                        return 0;
                    },
                    spatialReference: new SpatialReference({
                        wkid: 26912
                    }),
                    centerAndZoom: function () {},
                    onLoad: function () {},
                    width: 519,
                    extent: new Extent(16816.054547375796, 4041342.5115216, 888225.5612901922, 4704553.9858249)
                };
            });

            afterEach(function () {
                map = null;
            });

            it('should create a default symbol if a map was provided', function () {
                widget = new FindAddress({
                    map: map
                }).placeAt(win.body());

                expect(widget.symbol).not.toBeNull();
            });

            it('should assign a graphics layer if a map was provided', function () {
                widget = new FindAddress({
                    map: map
                }).placeAt(win.body());
                widget.map.onLoad();

                expect(widget.graphicsLayer).not.toBeNull();
                expect(widget.graphicsLayer).not.toBe('default');
            });

            it('should use my graphics layer if provided', function () {
                widget = new FindAddress({
                    map: map,
                    graphicsLayer: map.graphicsLayer
                }).placeAt(win.body());
                widget.map.onLoad();

                expect(widget.graphicsLayer.id).toEqual('default');
            });

            it('should zoom to a point after finding a valid address on a cached map', function () {
                var point = new Point(result.result.location.x, result.result.location.y, map.spatialReference);

                widget = new FindAddress({
                    map: map,
                    graphicsLayer: map.graphicsLayer
                }).placeAt(win.body());
                widget.txtAddress.value = address;
                widget.txtZone.value = zip;

                spyOn(widget, '_invokeWebService').and.callFake(function () {
                    var d = new Deferred();
                    d.resolve(result);

                    return d;
                });

                spyOn(widget.map, 'centerAndZoom').and.callThrough();

                widget.geocodeAddress();

                expect(widget.map.centerAndZoom).toHaveBeenCalledWith(point, 12);
                expect(widget.map._graphic).not.toBeNull();
            });

            it('should zoom to a point after finding a valid address on a dynamic map', function () {
                var point = new Point(result.result.location.x, result.result.location.y, map.spatialReference);

                map.getLevel = function () {
                    return -1;
                };

                widget = new FindAddress({
                    map: map,
                    graphicsLayer: map.graphicsLayer,
                    zoomLevel: 1
                }).placeAt(win.body());
                widget.txtAddress.value = address;
                widget.txtZone.value = zip;

                spyOn(widget, '_invokeWebService').and.callFake(function () {
                    var d = new Deferred();
                    d.resolve(result);

                    return d;
                });

                spyOn(widget.map, 'centerAndZoom').and.callThrough();

                widget.geocodeAddress();

                expect(widget.map.centerAndZoom).toHaveBeenCalledWith(point, 6345876.028756473);
                expect(widget.map._graphic).not.toBeNull();
            });

            it('should use constructor spatialReference first', function () {
                widget = new FindAddress({
                    map: map,
                    graphicsLayer: map.graphicsLayer,
                    wkid: 10
                }).placeAt(win.body());

                expect(widget.wkid).toEqual(10);
            });

            it('should use map spatialReference if no ctor param', function () {
                map.spatialReference = new SpatialReference({
                    wkid: 3857
                });

                widget = new FindAddress({
                    map: map,
                    graphicsLayer: map.graphicsLayer
                }).placeAt(win.body());

                expect(widget.wkid).toEqual(3857);
            });
        });
        describe('_validate', function () {
            beforeEach(function () {
                widget = new FindAddress(null, domConstruct.create('div', null, win.body()));
            });
            it('hides all error messages', function () {
                query('.help-inline.error', widget.domNode).style('display', 'visible');
                widget.txtAddress.value = address;
                widget.txtZone.value = zip;

                widget._validate();

                expect(query('.help-inline.error', widget.domNode).every(function (node) {
                    return domStyle.get(node, 'display') === 'none';
                })).toBe(true);
            });
            it('removes all error classes on control-groups', function () {
                query('.control-group', widget.domNode).addClass('error');
                widget.txtAddress.value = address;
                widget.txtZone.value = zip;

                widget._validate();

                expect(query('.control-group', widget.domNode).every(function (node) {
                    return !domClass.contains(node, 'error');
                })).toBe(true);
            });
        });
    });
});
