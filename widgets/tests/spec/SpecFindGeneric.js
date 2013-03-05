/*global afterEach, agrc, beforeEach, describe, dijit, dojo, esri, expect, it, runs, waits, waitsFor, spyOn, xit*/
var widget, map;

afterEach(function () {
	widget.destroyRecursive();
	widget = null;
});

beforeEach(function () {
	map = {
		graphicsLayer: {
			id: "default",
			clear: function () { },
			add: function () { }
		},
		setExtent: function () { },
		getLevel: function () { return 0; },
		spatialReference: new esri.SpatialReference({ wkid: 26912 }),
		centerAndZoom: function () { },
		onLoad: function () { },
		width: 519,
		extent: new esri.geometry.Extent(16816.054547375796, 4041342.5115216, 888225.5612901922, 4704553.9858249)
	};
});

describe('FindGeneric Tests', function () {
	it('should create search and envelope urls if layername and searchField are supplied', function () {
		widget = new agrc.widgets.locate.FindGeneric(
		{
			layerName: 'SGID93.BOUNDARIES.Municipalities',
			searchFieldName: 'Name',
			map: map,
			_getStoreForTextBox: function () { }
		}).placeAt(dojo.body());

		expect(widget._searchUrl).toBe('//mapserv.utah.gov/WSUT/GetFeatureAttributes.svc/find-generic-widget/layer(SGID93.BOUNDARIES.Municipalities)returnAttributes(Name)where(Name)(=)( )?dojo');
		expect(widget._envelopeUrl).toBe('//mapserv.utah.gov/WSUT/FeatureGeometry.svc/GetEnvelope/find-generic-widget/layer(SGID93.BOUNDARIES.Municipalities)where(Name)(=)([searchValue])quotes=true');
	});

	it('should set default values for label and fieldLabel if nothing is supplied', function () {
		// arrange
		widget = new agrc.widgets.locate.FindGeneric({ map: map }).placeAt(dojo.body());

		expect(widget.label).toBe('Generic');
		expect(widget.fieldLabel).toBe('Name');
	});

	it('_getDefaultLabel should set default label to sgid layer name if one is supplied', function () {
		// arrange
		widget = new agrc.widgets.locate.FindGeneric({ map: map }).placeAt(dojo.body());

		expect(widget._getDefaultLabel("SGID93.test.layerName")).toBe('layerName');
	});

	it('_getDefaultLabel should return Generic if layer is malformed', function () {
		// arrange
		widget = new agrc.widgets.locate.FindGeneric({ map: map }).placeAt(dojo.body());

		expect(widget._getDefaultLabel("SGID93.test")).toBe('Generic');
	});

	it('should successfully find a county', function () {
		// arrange
		var result = {
			"Count": 1,
			"Message": "",
			"Results": [{ "MaxX": 664924.41000000015, "MaxY": 4540665.5, "MinX": 584044.09999999963, "MinY": 4502973.91}]
		};

		widget = new agrc.widgets.locate.FindGeneric({
			layerName: 'SGID93.BOUNDARIES.Counties',
			searchFieldName: 'Name',
			map: map,
			_getStoreForTextBox: function () { }
		}).placeAt(dojo.body());

		spyOn(widget, '_invokeWebService').andCallFake(function () {
			var d = new dojo.Deferred();
			d.callback(result);

			return d;
		});

		spyOn(widget, 'find').andCallThrough();
		spyOn(widget, '_onFind').andCallThrough();
		spyOn(widget, 'onFind').andCallThrough();
		spyOn(widget, '_onError').andCallThrough();

		// act
		widget.find({ value: 'DAGGET' });

		// assert
		expect(widget.find).toHaveBeenCalled();
		expect(widget._invokeWebService).toHaveBeenCalledWith({ url: '//mapserv.utah.gov/WSUT/FeatureGeometry.svc/GetEnvelope/find-generic-widget/layer(SGID93.BOUNDARIES.Counties)where(Name)(=)(DAGGET)quotes=true' });

		expect(widget._onFind).toHaveBeenCalled();
		expect(widget._onFind).toHaveBeenCalledWith(result);

		expect(widget.onFind).toHaveBeenCalled();

		expect(widget._onError).not.toHaveBeenCalled();

		expect(dojo.style(widget.errorMsg, 'display')).toEqual('none');
		expect(widget.btn_find.isBusy).toBeFalsy();
	});

	xit('should update items after creation', function () {
		// arrange
		widget = new agrc.widgets.locate.FindGeneric({ layerName: 'SGID93.BOUNDARIES.Municipalities', searchFieldName: 'Name', map: map }).placeAt(dojo.body());
		var args = { layerName: 'SGID93.BOUNDARIES.Counties', searchFieldName: 'CountyNmbr', label: 'County', fieldLabel: 'Number' };

		spyOn(widget, '_getStoreForTextBox').andCallFake(function () { });

		// act
		widget.updateFindItemsWith(args);

		// assert
		expect(widget.fieldLabelNode.innerHTML).toEqual(args.fieldLabel);
		expect(widget.labelNode.innerHTML).toEqual(args.label);

		expect(widget._searchUrl).toBe('//mapserv.utah.gov/WSUT/GetFeatureAttributes.svc/find-generic-widget/layer(SGID93.BOUNDARIES.Counties)returnAttributes(CountyNmbr)where(CountyNmbr)(=)( )?dojo');
		expect(widget._envelopeUrl).toBe('//mapserv.utah.gov/WSUT/FeatureGeometry.svc/GetEnvelope/find-generic-widget/layer(SGID93.BOUNDARIES.Counties)where(CountyNmbr)(=)([searchValue])quotes=true');
	});
});
