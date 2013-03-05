/*global dojo, console, agrc, dijit, esri*/
//provide namespace
dojo.provide("agrc.widgets.locate.FindAddress");

dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dijit.form.FilteringSelect');
dojo.require('dojox.form.BusyButton');
dojo.require('dojo.io.script');

dojo.declare("agrc.widgets.locate.FindAddress", [dijit._Widget, dijit._Templated], {
	// description:
	//		**Summary**: A simple form tied to the map allowing a user to quickly zoom to an address.
	//		<p>
	//		**Owner(s)**: Scott Davis, Steve Gourley
	//		</p>
	//		<p>
	//		**Test Page**: <a href='/tests/dojo/agrc/1.0/agrc/widgets/tests/FindAddressTests.html' target='_blank'>
	//			agrc.widgets.map.FindAddress.Tests</a>
	//		</p>
	//		<p>
	//		**Description**:
	//		This widget hits the [agrc geocoding web service](http://gis.utah.gov/web-services/address-geolocator-2).
	//		</p>
	//		<p>
	//		**Published Topics**: (See the [Dojo Topic System](http://dojotoolkit.org/reference-guide/quickstart/topics.html))
	//		</p>
	//		<ul>
	//			<li>agrc.widgets.locate.FindAddress.OnFindStart[none]</li>
	//			<li>agrc.widgets.locate.FindAddress.OnFind[result]</li>
	//			<li>agrc.widgets.locate.FindAddress.OnFindError[err]</li>
	//		</ul>
	//		**Exceptions**:
	//		</p>
	//		<ul><li>agrc.widgets.locate.FindAddress NullReferenceException: map. Pass the map in the constructor.</li></ul>
	//		<p>
	//		**Required Files**:
	//		</p>
	//		<ul><li>agrc/themes/standard/locate/FindAddress.css</li></ul>
	//
	// example:
	// |	new agrc.widgets.locate.FindAddress({map: map}, 'test1');

	// widgetsInTemplate: [private] Boolean
	//		Specific to dijit._Templated.
	widgetsInTemplate: true,

	// baseClass: String
	//      base css class
	baseClass: 'agrc',

	// templatePath: [private] String
	//		Path to template. See dijit._Templated
	templatePath: dojo.moduleUrl("agrc.widgets.locate.templates", "FindAddress.html"),

	// _timeout: [private] Number
	//		Time in milliseconds that the widget will wait for a 
	//		response from the server before giving up.
	_timeout: 20000,

	// Parameters to constructor

	// map: esri.Map
	//		Reference to esri.Map
	map: null,

	// title: String
	//		Fieldset legend text.
	title: 'Find Street Address',

	// symbol: esri.symbol.MarkerSymbol
	//		Symbol used to show the matched location.
	symbol: null,

	// graphicsLayer: esri.layers.GraphicsLayer
	//		The graphics layer that you want to place the graphic in.
	//		This defaults to the map's graphics layer if nothing is passed in.
	graphicsLayer: null,

	// zoomLevel: Number
	//      the level to zoom to or the scale you want to zoom to in a dynamic map layer
	zoomLevel: 12,

	// _graphic: Object
	//      a reference to the esri.Graphic
	_graphic: null,

	constructor: function (params, div) {
		// summary:
		//		Constructor method
		// params: Object
		//		Parameters to pass into the widget. map is required. title, symbol, zoomLevel
		//		and graphicsLayer are optional.
		// div: String|DomNode
		//		A reference to the div that you want the widget to be created in.
		console.info(this.declaredClass + '::' + arguments.callee.nom);
	},

	postMixInProperties: function () {
		// summary:
		//      postMixin properties like symbol and graphics layer
		// description:
		//      decide whether to use default graphics layer and symbol
		// tags:
		//      public
		console.info(this.declaredClass + "::" + arguments.callee.nom);

		// default to use the map's graphics layer if none was passed in
		if (!this.graphicsLayer && !!this.map) {
			this.connect(this.map, 'onLoad', function () {
				this.graphicsLayer = this.map.graphics;
			});
		}

		// create symbol if none was provided in options
		if (!this.symbol && !!this.map) {
			this.symbol = new esri.symbol.SimpleMarkerSymbol();
			this.symbol.setStyle(esri.symbol.SimpleMarkerSymbol.STYLE_DIAMOND);
			this.symbol.setColor(new dojo.Color([255, 0, 0, 0.5]));
		}
	},

	postCreate: function () {
		// summary:
		//		Overrides method of same name in dijit._Widget.
		// tags:
		//		private
		console.info(this.declaredClass + '::' + arguments.callee.nom);

		this._wireEvents();
	},

	_wireEvents: function () {
		// summary:
		//		Wire events.
		// tags:
		//		private
		console.info(this.declaredClass + '::' + arguments.callee.nom);

		this.connect(this.txt_address, 'onKeyUp', "_checkEnter");
		this.connect(this.txt_zone, 'onKeyUp', "_checkEnter");
	},

	_checkEnter: function (event) {
		// summary:
		//		Handles onKeyUp function to check to see if the user pressed Enter.
		// tags:
		//		private
		console.info(this.declaredClass + '::' + arguments.callee.nom);

		// geocode on Enter key
		if (event.keyCode === dojo.keys.ENTER) {
			// move focus to button to make sure that the value is right
			this.btn_geocode.focus();

			this.geocodeAddress();
		}
	},

	geocodeAddress: function () {
		// summary:
		//		Geocodes the address if the text boxes validate.
		console.info(this.declaredClass + '::' + arguments.callee.nom);

		if (this._validate()) {
			dojo.publish('agrc.widgets.locate.FindAddress.OnFindStart');

			this.btn_geocode.makeBusy();

			if (this.map) {
				if (this._graphic) {
					this.graphicsLayer.remove(this._graphic);
				}
			}

			var address = this.txt_address.value;
			var zone = this.txt_zone.value;

			var deferred = this._invokeWebService({ address: address, zone: zone });

			dojo.when(deferred, dojo.hitch(this, '_onFind'), dojo.hitch(this, '_onError'));
		}
		else {
			this.btn_geocode.cancel();
		}
	},

	_invokeWebService: function (args) {
		// summary:
		//      calls the web service
		// description:
		//      sends the request to the wsut webservice
		// tags:
		//      private
		// returns:
		//     Deferred 
		console.info(this.declaredClass + "::" + arguments.callee.nom);

		var params = {
			callbackParamName: "callback",
			url: "//mapserv.utah.gov/wsut/Geocode.svc/sgid45/street(" + args.address + ")zone(" + args.zone + ")",
			handleAs: "json",
			timeout: this._timeout,
			preventCache: true
		};

		return dojo.io.script.get(params);
	},

	_validate: function () {
		// summary:
		//      validates the widget
		// description:
		//      makes sure the street and zone have valid data
		// tags:
		//      private
		// returns:
		//      bool
		console.info(this.declaredClass + "::" + arguments.callee.nom);

		var ok = true;

		// hide error message
		dojo.style(this.errorMsg, 'display', 'none');

		// check for valid address and zone
		if (!this.txt_address.isValid() || !this.txt_address.get('value').length) {
			this.txt_address._message = '';
			this.txt_address.displayMessage('Please enter an address.');

			ok = false;
		}

		if (!this.txt_zone.isValid() || !this.txt_zone.get('value').length) {
			this.txt_zone._message = '';
			this.txt_zone.displayMessage('Please enter a zip or city.');

			ok = false;
		}

		return ok;
	},

	onFind: function (result) {
		// summary:
		//      event for people to connect to
		// description:
		//      event fired when successful geocode happens
		// tags:
		//      public
	},

	_onFind: function (result, ioArgs) {
		// summary:
		//      handles a successful geocode
		// description:
		//      zooms the map if there is one. publishes the result
		// tags:
		//      private
		console.info(this.declaredClass + "::" + arguments.callee.nom);

		this.onFind(result);

		if (this.map) {
			var point = new esri.geometry.Point(result.UTM_X, result.UTM_Y, this.map.spatialReference);

			if (this.map.getLevel() > -1) {
				this.map.centerAndZoom(point, this.zoomLevel);
			}
			else {
				this.map.centerAndZoom(point, esri.geometry.getScale(this.map.extent, this.map.width, this.map.spatialReference.wkid) / this.zoomLevel);
			}

			this._graphic = new esri.Graphic(point, this.symbol, result);
			this.graphicsLayer.add(this._graphic);
		}

		this.btn_geocode.cancel();

		dojo.publish("agrc.widgets.locate.FindAddress.OnFind", [result]);
	},

	_onError: function (err) {
		// summary:
		//      handles script io geocoding error
		// description:
		//      publishes error
		// tags:
		//      private
		// returns:
		//       
		console.info(this.declaredClass + "::" + arguments.callee.nom);

		dojo.style(this.errorMsg, 'display', 'inline');

		// re-enable find button
		this.btn_geocode.cancel();

		dojo.publish('agrc.widgets.locate.FindAddress.OnFindError', [err]);
	}
});