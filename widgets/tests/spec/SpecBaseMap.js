/*global afterEach, agrc, beforeEach, describe, dijit, dojo, esri, expect, it, runs, waits, waitsFor*/
var map, testDiv;

beforeEach(function(){
	testDiv = dojo.create("div", {
		width: "300px",
		height: "300px"
	}, dojo.body());
});

afterEach( function() {
	map.destroy();
	map = null;
	dojo.destroy(testDiv);
});

describe("BaseMap - Default Options", function() {
	beforeEach( function() {
		map = new agrc.widgets.map.BaseMap(testDiv);

		waitsFor( function() {
			return map.loaded;
		}, "map to load", 5000);
	});

	it("should set the initial extent and spatial reference", function() {
		var expectedExtent = new esri.geometry.Extent({
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
		expect(lyr.url).toEqual("//mapserv.utah.gov/ArcGIS/rest/services/UtahBaseMap-Vector/MapServer");
	});
});

describe("BaseMap - Non-default Options", function() {
	it("should mixin options", function() {
		var params = {
			useDefaultExtent: false,
			defaultBaseMap: 'UtahBaseMap-Terrain'
		};

		map = new agrc.widgets.map.BaseMap(testDiv, params);

		expect(map.useDefaultExtent).toBeFalsy();
		expect(map.defaultBaseMap).toEqual("UtahBaseMap-Terrain");
	});

	describe('Full Extent Button', function() {
		var testButton;

		beforeEach( function() {
			map = new agrc.widgets.map.BaseMap(testDiv, {
				includeFullExtentButton: true
			});

			waitsFor( function() {
				testButton = dijit.byId(map.id + '_full-extent-button');
				return testButton;
			}, "testButton to be created", 5000);
		});

		it('should add the full extent button when specified in the options', function() {
			expect(testButton).toBeTruthy();
		});

		it('should zoom back out to the full extent when the button is pressed', function() {
			var fullExtent = dojo.clone(map.extent);
			map.panDown();

			waits(1000); // give map time to catch up
			runs( function() {
				testButton.onClick();

				waits(1000); // give map time to catch up
				runs( function() {
					expect(map.extent.ymin).toEqual(fullExtent.ymin);
				});
			});
		});
	});
});