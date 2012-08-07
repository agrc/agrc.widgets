/*global afterEach, agrc, beforeEach, describe, dijit, dojo, esri, expect, it, runs, waits, waitsFor, spyOn*/
var widget;

afterEach(function () {
	widget.destroyRecursive();
	widget = null;
});

describe('FindAddress Tests without map', function () {
	it('1. should not create a default symbol if no map was provided', function () {
		widget = new agrc.widgets.locate.FindAddress().placeAt(dojo.body());

		expect(widget.symbol).toBeNull();
	});

	it('2. should not assign a graphics layer if no map was provided', function () {
		widget = new agrc.widgets.locate.FindAddress().placeAt(dojo.body());

		expect(widget.graphicsLayer).toBeNull();
	});

	it('3. should validate when there is data in textboxes', function () {
		// arrange
		widget = new agrc.widgets.locate.FindAddress().placeAt(dojo.body());

		widget.txt_address.set('value', 'x');
		widget.txt_zone.set('value', 'x');

		expect(widget._validate()).toBeTruthy();
	});

	it('4. should not validate when there is data in textboxes', function () {
		// arrange
		widget = new agrc.widgets.locate.FindAddress().placeAt(dojo.body());

		widget.txt_address.set('value', 'x');

		expect(widget._validate()).toBeFalsy();
	});

	it('5. should successfully find a valid address', function () {
		// arrange
		var result = {
			MatchAddress: "2236 E Atkin Ave, 84109",
			Geocoder: "TRANSPORTATION.GC93_StatewideRoads",
			Score: 63,
			UTM_X: 430183.9199999999,
			UTM_Y: 4506834.02,
			LONG_X: -111.8265174,
			LAT_Y: 40.7094635
		};

		widget = new agrc.widgets.locate.FindAddress().placeAt(dojo.body());
		widget.txt_address.set('value', '2236 E Atkin Ave');
		widget.txt_zone.set('value', '84109');

		spyOn(widget, '_invokeWebService').andCallFake(function () {
			var d = new dojo.Deferred();
			d.callback(result);

			return d;
		});

		spyOn(widget, '_onFind').andCallThrough();
		spyOn(widget, 'onFind').andCallThrough();
		spyOn(widget, '_onError').andCallThrough();

		// act
		widget.geocodeAddress();

		// assert
		expect(widget._invokeWebService).toHaveBeenCalledWith({ address: '2236 E Atkin Ave', zone: '84109' });

		expect(widget._onFind).toHaveBeenCalled();
		expect(widget._onFind).toHaveBeenCalledWith(result);

		expect(widget.onFind).toHaveBeenCalled();

		expect(widget._onError).not.toHaveBeenCalled();

		expect(dojo.style(widget.errorMsg, 'display')).toEqual('none');
		expect(widget.btn_geocode.isBusy).toBeFalsy();
	});

	it('6. should display a not found message for a nonvalid address', function () {
		// arrange
		widget = new agrc.widgets.locate.FindAddress().placeAt(dojo.body());
		widget.txt_address.set('value', 'x');
		widget.txt_zone.set('value', 'x');

		spyOn(widget, '_invokeWebService').andCallFake(function () {
			var d = new dojo.Deferred();
			d.errback({});

			return d;
		});

		spyOn(widget, '_onFind').andCallThrough();
		spyOn(widget, '_onError').andCallThrough();

		// act
		widget.geocodeAddress();

		// assert
		expect(widget._invokeWebService).toHaveBeenCalledWith({ address: 'x', zone: 'x' });

		expect(widget._onError).toHaveBeenCalled();
		expect(widget._onFind).not.toHaveBeenCalled();

		expect(dojo.style(widget.errorMsg, 'display')).toEqual('block');
		expect(widget.btn_geocode.isBusy).toBeFalsy();
	});
});

describe('FindAddress Tests with map', function () {
	var map;

	beforeEach(function () {
		map = {
			graphicsLayer: {
				id: "default",
				clear: function () { },
				add: function () { }
			},
			getLevel: function () { return 0; },
			spatialReference: new esri.SpatialReference({ wkid: 26912 }),
			centerAndZoom: function () { },
			onLoad: function () { },
			width: 519,
			extent: new esri.geometry.Extent(16816.054547375796, 4041342.5115216, 888225.5612901922, 4704553.9858249)
		};
	});

	afterEach(function () {
		map = null;
	});

	it('1. should create a default symbol if a map was provided', function () {
		widget = new agrc.widgets.locate.FindAddress({ map: map }).placeAt(dojo.body());

		expect(widget.symbol).not.toBeNull();
	});

	it('2. should assign a graphics layer if a map was provided', function () {
		widget = new agrc.widgets.locate.FindAddress({ map: map }).placeAt(dojo.body());
		widget.map.onLoad();

		expect(widget.graphicsLayer).not.toBeNull();
		expect(widget.graphicsLayer).toNotBe("default");
	});

	it('3. should use my graphics layer if provided', function () {
		widget = new agrc.widgets.locate.FindAddress({ map: map, graphicsLayer: map.graphicsLayer }).placeAt(dojo.body());
		widget.map.onLoad();

		expect(widget.graphicsLayer.id).toEqual("default");
	});

	it('4. should zoom to a point after finding a valid address on a cached map', function () {
		// arrange
		var result = {
			MatchAddress: "2236 E Atkin Ave, 84109",
			Geocoder: "TRANSPORTATION.GC93_StatewideRoads",
			Score: 100,
			UTM_X: 430183.9199999999,
			UTM_Y: 4506834.02,
			LONG_X: -111.8265174,
			LAT_Y: 40.7094635
		},
		point = new esri.geometry.Point(result.UTM_X, result.UTM_Y, map.spatialReference);

		widget = new agrc.widgets.locate.FindAddress({ map: map, graphicsLayer: map.graphicsLayer }).placeAt(dojo.body());
		widget.txt_address.set('value', '2236 E Atkin Ave');
		widget.txt_zone.set('value', '84109');

		spyOn(widget, '_invokeWebService').andCallFake(function () {
			var d = new dojo.Deferred();
			d.callback(result);

			return d;
		});

		spyOn(widget.map, 'centerAndZoom').andCallThrough();

		// act
		widget.geocodeAddress();

		// assert
		expect(widget.map.centerAndZoom).toHaveBeenCalledWith(point, 12);
		expect(widget.map._graphic).not.toBeNull();
	});

	it('5. should zoom to a point after finding a valid address on a dynamic map', function () {
		// arrange
		var result = {
			MatchAddress: "2236 E Atkin Ave, 84109",
			Geocoder: "TRANSPORTATION.GC93_StatewideRoads",
			Score: 100,
			UTM_X: 430183.9199999999,
			UTM_Y: 4506834.02,
			LONG_X: -111.8265174,
			LAT_Y: 40.7094635
		},
		point = new esri.geometry.Point(result.UTM_X, result.UTM_Y, map.spatialReference);

		map.getLevel = function () { return -1; };

		widget = new agrc.widgets.locate.FindAddress({
			map: map,
			graphicsLayer: map.graphicsLayer,
			zoomLevel: 1
		}).placeAt(dojo.body());
		widget.txt_address.set('value', '2236 E Atkin Ave');
		widget.txt_zone.set('value', '84109');

		spyOn(widget, '_invokeWebService').andCallFake(function () {
			var d = new dojo.Deferred();
			d.callback(result);

			return d;
		});

		spyOn(widget.map, 'centerAndZoom').andCallThrough();

		// act
		widget.geocodeAddress();

		// assert
		expect(widget.map.centerAndZoom).toHaveBeenCalledWith(point, 6345876.028756473);
		expect(widget.map._graphic).not.toBeNull();
	});
});
