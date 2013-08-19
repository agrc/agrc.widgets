/*global dojo, console, agrc, dijit, esri, alert*/
// provide namespace
dojo.provide('agrc.widgets.locate.ZoomToCoords');

// dojo widget requires
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');

// other dojo requires
dojo.require('dijit.form.NumberTextBox');
dojo.require('dijit.form.Select');
dojo.require('dijit.layout.StackContainer');
dojo.require('dijit.layout.ContentPane');

dojo.declare('agrc.widgets.locate.ZoomToCoords', [dijit._Widget, dijit._Templated], {
	// description:
	//    **Summary**: Used to zoom to a point on the map specified by a pair of coordinates that may or
	//		may not be in the same coordinate system as the map.
	//    <p>
	//    **Owner(s)**: Scott Davis
	//    </p>
	//    <p>
	//    **Test Page**: <a href='/tests/dojo/agrc/1.0/agrc/widgets/tests/ZoomToCoordsTests.html' target='_blank'>
	//      agrc.widgets.map.ZoomToCoords.Test</a>
	//    </p>
	//    <p>
	//    **Description**:
	//    Provides the ability to enter coordinates in three formats: Decimal Degrees, Degrees Decimal Minutes, and
	//		Degrees, Minutes, Seconds. Others may be added in the future.
	//    </p>
	//    <p>
	//    **Required Files**:
	//    </p>
	//    <ul><li>agrc/themes/standard/locate/ZoomToCoords.css</li></ul>
	// example:
	// |  var map = new agrc.widgets.map.BaseMap('basemap-div', options);
	// |  new agrc.widgets.locate.ZoomToCoords({map: map}, 'test-div');

	// widgetsInTemplate: [private] Boolean
	//    Specific to dijit._Templated.
	widgetsInTemplate: true,

	// templatePath: [private] String
	//    Path to template. See dijit._Templated
	templatePath: dojo.moduleUrl('agrc.widgets.locate', 'templates/ZoomToCoords.html'),

	// geoServiceURL: String
	//		The url to the geometry service
	geoServiceURL: 'http://mapserv.utah.gov/ArcGIS/rest/services/Geometry/GeometryServer',

	// _geoService: [private] esri.tasks.GeometryService
	//		A pointer to the geometry service object
	_geoService: null,

	// _inputSpatialReference: [private] esri.SpatialReference
	//		The spatial reference used to create the input point to be projected
	_inputSpatialReference: null,

	// _graphicsLayer: [private] esri.layers.GraphicsLayer
	//		The graphics layer that the projected points will be added to.
	//		This is to prevent any collisions with any other graphics that
	//		may be on the map
	_graphicsLayer: null,

	// Parameters to constructor

	// map: esri.Map
	//		The map that you want to hook the widget to
	map: null,

	// zoomLevel: Number
	//		The cache level that you want to zoom to. Defaults to 12.
	zoomLevel: 12,

	constructor: function (params, div) {
		// summary:
		//    Constructor method
		// params: Object
		//    Parameters to pass into the widget. Required values include: map. Optional values include: zoomLevel.
		// div: String|DomNode
		//    A reference to the div that you want the widget to be created in.
		console.info(this.declaredClass + '::' + arguments.callee.nom);
	},

	postCreate: function () {
		// summary:
		//    Overrides method of same name in dijit._Widget.
		// tags:
		//    private
		console.info(this.declaredClass + '::' + arguments.callee.nom);

		this._geoService = new esri.tasks.GeometryService(this.geoServiceURL);

		// add new graphics layer to keep them seperate from any other graphics that may be on the map
		this._graphicsLayer = new esri.layers.GraphicsLayer();
		this.map.addLayer(this._graphicsLayer);

		this._wireEvents();

		this.stackContainer.startup(); // required to get it to layout correctly.
	},

	_wireEvents: function () {
		// summary:
		//    Wires events.
		// tags:
		//    private
		console.info(this.declaredClass + '::' + arguments.callee.nom);

		this.connect(this.zoomButton, 'onClick', this._onZoomClick);
		this.connect(this._geoService, 'onError', this._onGeoServiceError);
		this.connect(this._geoService, 'onProjectComplete', this._onProjectComplete);
		this.connect(this.typeSelect, "onChange", this._onTypeChange);
	},

	_onZoomClick: function () {
		// summary:
		//		Fires when the user clicks on the Zoom button
		console.info(this.declaredClass + '::' + arguments.callee.nom);

		var coords = this.getCoords(this.typeSelect.get("value"));
		console.log(coords);

		var point = new esri.geometry.Point(coords.x, coords.y, this._inputSpatialReference);

		if (point.spatialReference !== this.map.spatialReference) {
			this._geoService.project([point], this.map.spatialReference);
		}
		else {
			this._zoomToPoint(point);
		}
	},

	_onGeoServiceError: function (error) {
		// summary:
		//		Handles any errors returned by the geometry service
		// error: Error
		//		A JavaScript error object
		console.info(this.declaredClass + '::' + arguments.callee.nom);

		alert('There was an error with the Geometry Service.' + error.message);
	},

	_onProjectComplete: function (geometries) {
		// summary:
		//		Handles the callback from the project function on the geometry service
		// geometries: Geometry[]
		//		An array of the projected geometries.
		console.info(this.declaredClass + '::' + arguments.callee.nom);

		var newPoint = geometries[0];

		// check for bad point
		if (isNaN(newPoint.x)) {
			alert('Bad point returned. Please check your coordinates.');
			return;
		}

		// clear any
		this._graphicsLayer.clear();

		// create new geometry. The returned geometry is just an object with x and y. No spatial reference.
		newPoint.spatialReference = this.map.spatialReference;

		var point = new esri.geometry.Point(newPoint, this.map.spatialReference);

		var graphic = new esri.Graphic(point, new esri.symbol.SimpleMarkerSymbol(), null, null);

		this._graphicsLayer.add(graphic);

		this.map.centerAndZoom(point, this.zoomLevel);

		this._zoomToPoint(point);
	},

	_zoomToPoint: function (point) {
		// summary:
		//      Zoom to the point created 
		// description:
		//      clears old map graphics and centers and zooms on the input point
		// tags:
		//      private
		console.info(this.declaredClass + "::" + arguments.callee.nom);

		// clear any
		this._graphicsLayer.clear();

		var graphic = new esri.Graphic(point, new esri.symbol.SimpleMarkerSymbol(), null, null);

		this._graphicsLayer.add(graphic);

		this.map.centerAndZoom(point, this.zoomLevel);
	},

	_onTypeChange: function (newValue) {
		// summary:
		//		Fires when the user changes the value of the drop-down.
		//		Moves the stack container to the appropriate pane.
		console.info(this.declaredClass + "::" + arguments.callee.nom);

		var child;

		switch (newValue) {
			case "dd":
				child = this.dd;
				break;
			case "dm":
				child = this.dm;
				break;
			case "dms":
				child = this.dms;
				break;
			case "utm":
				child = this.utm;
				break;
		}

		this.stackContainer.selectChild(child);
	},

	getCoords: function (type) {
		// summary:
		//		Coverts the appropriate set of coordinates to decimal degrees
		// type: String
		//		The type of coordinates that you want back. Accepted values are found 
		//		in the drop down.
		// returns: Object{x:Number,y:Number}
		console.info(this.declaredClass + "::" + arguments.callee.nom);

		function convert(value) {
			// summary:
			//		converts minutes to decimal degrees or seconds to decimal minutes
			var min = parseFloat(value);
			return min / 60;
		}

		var coords = {};
		switch (type) {
			case "dd":
				coords.x = parseFloat('-' + this._getTextBoxValue(this.w_deg_dd));
				coords.y = parseFloat(this._getTextBoxValue(this.n_deg_dd));
				this._inputSpatialReference = new esri.SpatialReference({
					wkid: 4326
				});
				break;
			case "dm":
				coords.x = -(parseFloat(this._getTextBoxValue(this.w_deg_dm)) + convert(this._getTextBoxValue(this.w_min_dm)));
				coords.y = parseFloat(this._getTextBoxValue(this.n_deg_dm)) + convert(this._getTextBoxValue(this.n_min_dm));
				this._inputSpatialReference = new esri.SpatialReference({
					wkid: 4326
				});
				break;
			case "dms":
				var sec = convert(this._getTextBoxValue(this.w_sec_dms));
				var min = parseFloat(this._getTextBoxValue(this.w_min_dms)) + sec;
				coords.x = -(parseFloat(this._getTextBoxValue(this.w_deg_dms)) + convert(min));
				sec = convert(this._getTextBoxValue(this.n_sec_dms));
				min = parseFloat(this._getTextBoxValue(this.n_min_dms)) + sec;
				coords.y = parseFloat(this._getTextBoxValue(this.n_deg_dms)) + convert(min);
				this._inputSpatialReference = new esri.SpatialReference({
					wkid: 4326
				});
				break;
			case "utm":
				coords.x = this._getTextBoxValue(this.x_utm);
				coords.y = this._getTextBoxValue(this.y_utm);
				this._inputSpatialReference = new esri.SpatialReference({
					wkid: 26912
				});
				break;
		}

		return coords;
	},

	_getTextBoxValue: function (textBox) {
		// summary:
		//
		console.info(this.declaredClass + "::" + arguments.callee.nom);

		var value = textBox.get("value");
		return (value) ? value : 0;
	}
});