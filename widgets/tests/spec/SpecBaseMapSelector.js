/*global afterEach, agrc, beforeEach, describe, dijit, dojo, esri, expect, it, runs, waits, waitsFor, console*/
var widget;

afterEach(function () {
	widget.destroyRecursive();
	widget = null;
});

describe('BaseMapSelector Tests', function () {
	var map, data, okGo = false, connect;

	beforeEach(function () {
		data = [{
			"label": "Terrain",
			"layers": [
		{
			"url": "//mapserv.utah.gov/ArcGIS/rest/services/UtahBaseMap-Terrain/MapServer",
			"opacity": 1
		}
	]
		}, {
			"label": "Hybrid",
			"layers": [
		{
			"url": "//mapserv.utah.gov/ArcGIS/rest/services/UtahBaseMap-Hybrid/MapServer",
			"opacity": 1
		}
	]
		}, {
			"label": "Streets",
			"layers": [
		{
			"url": "//mapserv.utah.gov/ArcGIS/rest/services/UtahBaseMap-Vector/MapServer",
			"opacity": 1
		}
	]
		}, {
			"label": "Imagery",
			"layers": [
		{
			"url": "//mapserv.utah.gov/ArcGIS/rest/services/UtahBaseMap-Imagery2009/MapServer",
			"opacity": 1
		}
	]
		}, {
			"label": "Topo",
			"layers": [
		{
			"url": "//mapserv.utah.gov/ArcGIS/rest/services/UtahBaseMap-Topo/MapServer",
			"opacity": 1
		}
	]
		}, {
			"label": "Lite",
			"layers": [
		{
			"url": "//mapserv.utah.gov/ArcGIS/rest/services/UtahBaseMap-Lite/MapServer",
			"opacity": 1
		}
	]
		}, {
			"label": "Hillshade",
			"layers": [
		{
			"url": "//mapserv.utah.gov/ArcGIS/rest/services/UtahBaseMap-Hillshade/MapServer",
			"opacity": 1
		}
	]
		}];
		dojo.create("div", { id: "test-map" }, dojo.body());
		map = new esri.Map("test-map", { slider: false });
		connect = dojo.connect(map, 'onLoad', function () { okGo = true; });
	});

	afterEach(function () {

		try {
			if (map) {
				map.destroy();
				console.log('destroying map');
			}
		} catch (e) {

		}

		try {
			if (map.infoWindow) {
				map.infoWindow.destroy();
				console.log('destroying infowindow');
			}
		} catch (er) {

		}

		map = null;

		var mapContainer = dojo.byId("test-map");
		if (mapContainer) {
			dojo.destroy(mapContainer);
		}

		okGo = false;
		dojo.disconnect(connect);
	});

	it('1. if data is not passed in data should be cached from defaultThemeInfos.js', function () {
		widget = new agrc.widgets.map.BaseMapSelector({ map: map }).placeAt(dojo.body());
		waitsFor(function () { return okGo; }, "Waiting for map to load", 5000);

		expect(widget.data).toEqual(data);
	});

	it('2. should set current theme to Terrain if none is provided', function () {
		widget = new agrc.widgets.map.BaseMapSelector({ map: map }).placeAt(dojo.body());
		waitsFor(function () { return okGo; }, "Waiting for map to load", 5000);

		expect(widget.currentTheme.label).toEqual("Terrain");
	});

	it('3. should set current theme to user specified label', function () {
		widget = new agrc.widgets.map.BaseMapSelector({ map: map, defaultThemeLabel: 'Lite' }).placeAt(dojo.body());
		waitsFor(function () { return okGo; }, "Waiting for map to load", 5000);

		expect(widget.currentTheme.label).toEqual("Lite");
	});

	it('4. should cycle through all themes in round', function () {
		widget = new agrc.widgets.map.BaseMapSelector({ map: map, defaultThemeLabel: 'Lite' }).placeAt(dojo.body());

		waitsFor(function () { return okGo; }, "Waiting for map to load", 5000);

		runs(function () {
			dojo.forEach(data.length, function () {
				widget.shuffle();
			}, this);

			expect(widget.currentTheme.label).toEqual("Lite");
		});
	});

	it('5. should change to specified theme', function () {
		widget = new agrc.widgets.map.BaseMapSelector({ map: map, defaultThemeLabel: 'Lite' }).placeAt(dojo.body());

		waitsFor(function () { return okGo; }, "Waiting for map to load", 5000);

		runs(function () {
			widget.changeTheme("Terrain");

			expect(widget.currentTheme.label).toEqual("Terrain");
		});
	});

	it('6. should shuffle in reverse', function () {
		widget = new agrc.widgets.map.BaseMapSelector({ map: map, defaultThemeLabel: 'Terrain' }).placeAt(dojo.body());

		waitsFor(function () { return okGo; }, "Waiting for map to load", 5000);

		runs(function () {
			widget.shuffle({ direction: 'reverse' });
		});
	});

	it('7. should cycle through all themes in round in reverse', function () {
		widget = new agrc.widgets.map.BaseMapSelector({ map: map, defaultThemeLabel: 'Lite' }).placeAt(dojo.body());

		waitsFor(function () { return okGo; }, "Waiting for map to load", 5000);

		runs(function () {
			dojo.forEach(data.length, function () {
				widget.shuffle({ direction: 'reverse' });
			}, this);

			expect(widget.currentTheme.label).toEqual("Lite");
		});
	});
});