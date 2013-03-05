/*global afterEach, agrc, beforeEach, describe, dijit, dojo, esri, expect, it, runs, waits, waitsFor, spyOn*/
describe("_LayerList suite", function () {
	var widget, testLayer;

	beforeEach(function () {
		testLayer = {
			visibleLayers: [0],
			setVisibleLayers: function (layers) {
				this.visibleLayers = layers;
			},
			visible: true,
			layerInfos: [{
				name: 'test',
				id: 0,
				defaultVisibility: true,
				parentLayerId: -1
			},
			{
				name: 'test2',
				id: 1,
				defaultVisibility: false,
				parentLayerId: -1
			}]
		};
	});

	afterEach(function () {
		widget.destroyRecursive();
		widget = null;
		testLayer = null;
	});

	it("_buildLayerList populates a store with data", function () {

		widget = new agrc.widgets.layer.LayerList({ layer: testLayer }).placeAt(dojo.body());

		var count = 0;
		widget._store.fetch({ onBegin: function (total) { count = total; } });

		expect(count).toEqual(2);
	});

	it("excludeLayers removes layer from list", function () {

		widget = new agrc.widgets.layer.LayerList({
			layer: testLayer,
			excludedLayerNodes: ["test", "test2"]
		}).placeAt(dojo.body());

		var count = 0;
		widget._store.fetch({ onBegin: function (total) { count = total; } });

		expect(count).toEqual(0);
	});

	it("includedLayers only keeps layers in list", function () {

		widget = new agrc.widgets.layer.LayerList({
			layer: testLayer,
			includedLayerNodes: ["test"]
		}).placeAt(dojo.body());

		var count = 0;
		widget._store.fetch({ onBegin: function (total) { count = total; } });

		expect(count).toEqual(1);

		widget._store.fetch({ query: { name: 'test' },
			queryOptions: {
				deep: true
			},
			onItem: dojo.hitch(this, function (item) {
				var id = widget._store.getValue(item, 'id');
				expect(id).toEqual(0);
			})
		});
	});

	it("includedLayers trumps excluded layers", function () {

		widget = new agrc.widgets.layer.LayerList({
			layer: testLayer,
			includedLayerNodes: ["test"],
			excludedLayerNodes: ["test"]
		}).placeAt(dojo.body());

		var count = 0;
		widget._store.fetch({ onBegin: function (total) { count = total; } });

		expect(count).toEqual(1);

		widget._store.fetch({ query: { name: 'test' },
			queryOptions: {
				deep: true
			},
			onItem: dojo.hitch(this, function (item) {
				var id = widget._store.getValue(item, 'id');
				expect(id).toEqual(0);
			})
		});
	});

	it("visibleLayerIds match default visibility", function () {

		spyOn(testLayer, 'setVisibleLayers').andCallThrough();

		widget = new agrc.widgets.layer.LayerList({ layer: testLayer }).placeAt(dojo.body());

		expect(testLayer.setVisibleLayers).toHaveBeenCalled();
		expect(testLayer.setVisibleLayers).toHaveBeenCalledWith([0]);
	});

	it("visibleLayerIds match updated visibility", function () {

		testLayer.setVisibleLayers([1]);

		expect(testLayer.visibleLayers).toEqual([1]);

		spyOn(testLayer, 'setVisibleLayers').andCallThrough();

		widget = new agrc.widgets.layer.LayerList({ layer: testLayer }).placeAt(dojo.body());
		
		expect(testLayer.setVisibleLayers).toHaveBeenCalled();
		expect(testLayer.setVisibleLayers.mostRecentCall.args).toEqual([[1]]);
	});
});