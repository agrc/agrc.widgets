/*global dojo, console, agrc, dijit, esri*/
dojo.provide("agrc.widgets.locate.FindGeneric");

dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dojox.form.BusyButton');
dojo.require('dijit.form.FilteringSelect');
dojo.require('dojo.data.ItemFileReadStore');

dojo.declare("agrc.widgets.locate.FindGeneric", [dijit._Widget, dijit._Templated], {
	// description:
	//		**Summary**: A simple form tied to the map allowing a user to quickly zoom to a feature
	//		within any layer in SDE.
	//		<p>
	//		**Owner(s)**: Scott Davis, Steve Gourley
	//		</p>
	//		<p>
	//		**Test Page**: <a href='/tests/dojo/agrc/1.0/agrc/widgets/tests/FindGenericTests.html' target='_blank'>
	//			agrc.widgets.map.FindGeneric.Tests</a>
	//		</p>
	//		<p>
	//		**Description**:
	//		Pass in any layer in SDE with a field name that you want to search.	NOTE: Doesn't work 
	//		with large datasets (ie GNIS). Need to rewrite GetFeatureAttributes web service to enable 
	//		LIKE queries. Then you could refresh the datastore on every click instead of trying to 
	//		load all features at initialization.
	//		</p>
	//		<p>
	//		**Published Topics**: (See the [Dojo Topic System](http://dojotoolkit.org/reference-guide/quickstart/topics.html))
	//		</p>
	//		<ul><li>agrc.widgets.locate.FindGeneric.OnZoom[none]</li>
	//		<p>
	//		**Exceptions**:
	//		</p>
	//		<ul><li>agrc.widgets.locate.FindGeneric NullReferenceException: map. Pass the map in the constructor.</li></ul>
	//		<p>
	//		**Required Files**: 
	//		</p>
	//		<ul><li>agrc/themes/standard/locate/FindGeneric.css</li></ul>
	//
	// example:
	// |	new agrc.widgets.locate.FindGeneric({
	// |		map: map,
	// |		layerName: 'SGID93.BOUNDARIES.Counties',
	// |		searchFieldName: 'NAME',
	// |		label: 'Counties',
	// |		fieldLabel: 'Name'
	// |	}, 'test2');

	// widgetsInTemplate: [private] Boolean
	//		Specific to dijit._Templated.
	widgetsInTemplate: true,

	// baseClass: String
	//      base css class
	baseClass: 'agrc',

	// templatePath: [private] String
	//		Path to template. See dijit._Templated
	templatePath: dojo.moduleUrl("agrc.widgets.locate.templates", "FindGeneric.html"),

	// attributeMap: [private] Object
	//		Attribute map.
	attributeMap: dojo.delegate(dijit._Widget.prototype.attributeMap, {
		label: {
			node: 'labelNode',
			type: 'innerHTML'
		},
		fieldLabel: {
			node: 'fieldLabelNode',
			type: 'innerHTML'
		}
	}),

	// _searchUrl: [private] String
	//		the url to the agrc map service that the validation text box points at;
	_searchUrl: '',

	// _searchUrlTemplate: [private] String
	//		the template url to the agrc map service that the validation text box points at;
	_searchUrlTemplate: 'http://mapserv.utah.gov/WSUT/GetFeatureAttributes.svc/find-generic-widget/layer({layerName})returnAttributes({searchFieldName})where({searchFieldName})(=)( )?dojo',

	// _envelopeUrl: [private] String
	//		The url to the agrc map service that returns the feature envelope.
	_envelopeUrl: '',

	// _envelopeUrlTemplate: [private] String
	//		The template url to the agrc map service that returns the feature envelope.
	_envelopeUrlTemplate: 'http://mapserv.utah.gov/WSUT/FeatureGeometry.svc/GetEnvelope/find-generic-widget/layer({layerName})where({searchFieldName})(=)([searchValue])quotes=true',

	// _store: dojo.data.Store
	//      the autocomeplete store
	_store: null,
	
	// Parameters to constructor

	// layerName: String
	//		The layer to search - must be full name (ie. SGID93.BOUNDARIES.Counties) 
	//		and an existing layer in SDE.
	layerName: '',

	// searchFieldName: String
	//		The field that you want the validation text box to search (ie. NAME).
	searchFieldName: '',

	// label: String
	//		The text that shows up in the ui. If none is provided, then it 
	//		defaults to the last part of the layerName (ie. Counties)
	label: '',

	// fieldLabel: String
	//		The label that goes next to the text box defaults to be the same as label above.
	fieldLabel: '',

	// map: esri.Map
	//		A reference to esri.Map.
	map: null,
	
	// displayDropDownArrow: Boolean
	//		Controls whether or not the drop down arrow is displayed on
	//		the filtering select. Defaults to false
	displayDropDownArrow: false,

	constructor: function (params, div) {
		// summary:
		//		Constructor method
		// params: Object
		//		Parameters to pass into the widget. Must specify map, layerName,
		//		and searchFieldName. label, fieldLabel, and displayDropDownArrow are optional.
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

		// check for map
		if (!this.map) {
			throw new Error(this.declaredClass + " NullReferenceException: map.  Pass the map in the constructor.");
		}

		if (!this.label) {
			this.label = this._getDefaultLabel(this.layerName);
		}

		if (!this.fieldLabel) {
			this.fieldLabel = 'Name';
		}
	},

	postCreate: function () {
		// summary:
		//		Overrides method of same name in dijit._Widget.
		// tags:
		//		private
		console.info(this.declaredClass + "::" + arguments.callee.nom);

		// build urls
		this.updateFindItemsWith({
			layerName: this.layerName,
			searchFieldName: this.searchFieldName,
			label: this.label,
			fieldLabel: this.fieldLabel
		});

		this._wireEvents();
	},

	_getDefaultLabel: function (layerName) {
		// summary:
		//		Gets the last part of the layer name.
		// returns: String
		//		The default label.
		// tags:
		//		private
		console.info(this.declaredClass + "::" + arguments.callee.nom);

		var label = "Generic";

		if (layerName) {
			// returns the last part of the layer name
			// eg: SGID93.Category.Layer
			var split = layerName.split('.');
			if (split.length === 3) {
				label = split[2];
			}
		}

		return label;
	},

	_wireEvents: function () {
		// summary:
		//		Wire events.
		// tags:
		//		private
		console.info(this.declaredClass + "::" + arguments.callee.nom);

		this.connect(this.txt_box, "onKeyUp", this._checkEnter);
	},

	_checkEnter: function (event) {
		// summary:
		//		Checks to see if the Enter key was pressed and zooms if it was pressed.
		// tags:
		//		private
		//		console.info(this.declaredClass + "::" + arguments.callee.nom);

		// zoom on Enter key
		if (event.keyCode === dojo.keys.ENTER) {
			this.find();
		}
	},

	find: function (args) {
		// summary: 
		//      initiate the find
		// description:
		//      calls the webservice
		// tags:
		//      public
		console.info(this.declaredClass + "::" + arguments.callee.nom);

		if (this.txt_box.isValid()) {
			// hide error message
			dojo.style(this.errorMsg, 'display', 'none');
			this.btn_find.makeBusy();

			var value = (args && args.value) ? args.value : this.txt_box.get('displayedValue');

			var url = this._envelopeUrl.replace('[searchValue]', value);

			var deferred = this._invokeWebService({ url: url });

			dojo.when(deferred, dojo.hitch(this, '_onFind'), dojo.hitch(this, '_onError'));
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

		// set up url

		var params = {
			callbackParamName: "callback",
			url: args.url,
			handleAs: "json"
		};

		return dojo.io.script.get(params);
	},

	onFind: function (result) {
		// summary:
		//      event fired after successful find
		// description:
		//      for user connections
		// tags:
		//      public
		// returns:
		//       
	},

	_onFind: function (result) {
		// summary:
		//      zooms the map to the exent of the response
		// description:
		//      creates an esri Extent and zooms the map
		// tags:
		//      private
		console.log(this.declaredClass + "::" + arguments.callee.nom);

		var query = { query: this.txt_box.get('displayedValue') };

		this.onFind(dojo.mixin(result, query));

		// get first result
		if (result && result.Count && result.Count > 0) {
			var ext = result.Results[0];

			// create new extent
			var extent = new esri.geometry.Extent({
				xmin: ext.MinX,
				ymin: ext.MinY,
				xmax: ext.MaxX,
				ymax: ext.MaxY,
				spatialReference: {
					wkid: 26912
				}
			});

			this.map.setExtent(extent, true);

			this.btn_find.cancel();

			dojo.publish('agrc.widgets.locate.FindGeneric.OnFind');
		}
		else {
			this._onError(result);
		}
	},

	_getStoreForTextBox: function () {
		// summary:
		//		Get all of the features within the layer and jams them into
		//		the store for the validation text box. TODO: this needs to be
		//		changed once the web service is changed to support LIKE.
		// tags:
		//		private
		console.info(this.declaredClass + "::" + arguments.callee.nom);

		dojo.io.script.get({
			callbackParamName: "callback",
			url: this._searchUrl,
			handleAs: "json",
			load: dojo.hitch(this, function (result, ioArgs) {
				this._store = new dojo.data.ItemFileReadStore({
					data: result
				});

				this.txt_box.set('store', this._store);
			}),
			error: dojo.hitch(this, function (error) {
				this._onError("There has been an error with ArcGIS Server.\n" + error.message);
			})
		});
	},

	_onError: function (err) {
		// summary:
		//      handles script io geocoding error
		// description:
		//      publishes error
		// tags:
		//      private
		console.info(this.declaredClass + "::" + arguments.callee.nom);

		dojo.style(this.errorMsg, 'display', 'block');

		// re-enable find button
		this.btn_find.cancel();

		dojo.publish('agrc.widgets.locate.FindGeneric.OnFindError', [err]);
	},

	updateFindItemsWith: function (args) {
		// summary:
		//      updates the layer and field being found
		// description:
		//      take a property bag of layerName and searchFieldName, label, or fieldLabel to update widget to search other layer and fields
		// tags:
		//      public
		console.info(this.declaredClass + "::" + arguments.callee.nom);

		if (args.layerName && args.searchFieldName) {
			this._searchUrl = dojo.replace(this._searchUrlTemplate, {
				layerName: args.layerName,
				searchFieldName: args.searchFieldName
			});

			this._envelopeUrl = dojo.replace(this._envelopeUrlTemplate, {
				layerName: args.layerName,
				searchFieldName: args.searchFieldName
			});

			this._getStoreForTextBox();
		}

		if (args.label) {
			this.set('label', args.label);
		}

		if (args.fieldLabel) {
			this.set('fieldLabel', args.fieldLabel);
		}
	}
});
