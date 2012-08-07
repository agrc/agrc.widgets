/*global dojo, console, agrc, dijit, esri, clearTimeout, setTimeout*/
// provide namespace
dojo.provide('agrc.widgets.locate.MagicZoom');

// dojo widget requires
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');

// other dojo requires
dojo.require('dijit.form.ValidationTextBox');

dojo.declare('agrc.widgets.locate.MagicZoom', [dijit._Widget, dijit._Templated], {
	// description:
	//		**Summary**: Provides a text box with autocomplete that allows quick zooming
	//		to features in a layer within a mapservice.
	//		<p>
	//		**Owner(s)**: Scott Davis
	//		</p>
	//		<p>
	//		**Test Page**: <a href='/tests/dojo/agrc/1.0/agrc/widgets/tests/MagicZoomTests.html' target='_blank'>agrc.widgets.map.MagicZoom.Test</a>
	//		</p>
	//		<p>
	//		**Description**:
	//		This widget provides a quick way to search for and zoom to a specific feature
	//		or features within a single layer of a map service. It removes duplicate 
	//		values in the autocomplete list and then zooms to multiple point features, if appropriate.
	//		</p>
	//		<p>
	//		**Published Topics**:
	//		</p>
	//		<ul><li>agrc.widgets.locate.MagicZoom.onZoom</li></ul>
	//		<p>
	//		**Exceptions**:
	//		</p>
	//		<ul><li>None</li></ul>
	//		<p>
	//		**Required Files**:
	//		</p>
	//		<ul><li>agrc/themes/standard/locate/MagicZoom.css</li></ul>
	//
	// example:
	// |	var map = new agrc.widgets.map.BaseMap('map-div');
	// |	var zoom = new agrc.widgets.locate.MagicZoom({
	// |		promptMessage: 'Please type an API...',
	// |		mapServiceURL: 'http://mapserv.utah.gov/ArcGIS/rest/services/OilGasMining/MapServer',
	// |		searchLayerIndex: 0,
	// |		searchField: 'API',
	// |		map: map,
	// |		maxResultsToDisplay: 10
	// |	}, 'search-div');
	// |	zoom.startup();		
	
	// widgetsInTemplate: [private] Boolean
	//		Specific to dijit._Templated.
	widgetsInTemplate: true,
	
	// templatePath: [private] String
	//		Path to template. See dijit._Templated
	templateString: dojo.cache('agrc.widgets.locate', 'templates/MagicZoom.html'),
	
	// _deferred: [private] Dojo.Deferred
	//		Dojo.Deferred for canceling pending requests.	
	_deferred: null, 
	
	// _addingGraphic: [private] Boolean
	//		switch to prevent a new graphic from being cleared
	_addingGraphic: true,

	// symbolFill: esri.symbol
	//		esri.symbol zoom graphic symbol for polygons.
	symbolFill: null,
	
	// symbolLine: esri.symbol
	//     esri.symbol zoom graphic symbol for polylines.
	symbolLine: null,
	
	// symbolPoint: esri.symbol
	//		esri.symbol zoom graphic symbol for points.
	symbolPoint: null,
	
	// _graphicsLayer: [private] esri.layers.GraphicsLayer
	//		esri.layers.GraphicsLayer to hold graphics.
	_graphicsLayer: null,
	
	// _isOverTable: Boolean
	//		A switch to help with onBlur callback on search box.
	_isOverTable: false,
	
	// _timer: Object
	//		A timer to delay the search so that it doesn't fire too 
	//		many times when typing quickly.
	_timer: null,
	
	// _currentIndex: Integer
	//		The index of the currently selected item in the results.
	_currentIndex: 0,
	
	// Parameters to constructor
	
	// map: esri.Map
	//		esri.Map reference.
	map: null,
	
	// promptMessage: String
	//		The label that shows up in the promptMessage for the text box.
	promptMessage: '',
	
	// mapServiceURL: String
	//		The URL to the map service that you want to search.
	mapServiceURL: '',
	
	// searchLayerIndex: Integer
	//		The index of the layer within the map service to be searched.
	searchLayerIndex: 0,
	
	// searchField: String
	//		The field name that is to be searched.
	searchField: '',
	
	// zoomLevel: Integer
	//		The number of cache levels up from the bottom that you want to zoom to.
	zoomLevel: 5,
	
	// maxResultsToDisplay: Integer
	//		The maximum number of results that will be displayed.
	//		If there are more, no results are displayed.
	maxResultsToDisplay: 20,
	
	// placeHolder: String
	//     The placeholder text in the text box
	placeHolder: 'Map Search...',
	
	// tooltipPosition: String
	tooltipPosition: 'before',
	
	// token: String
	//      Allows the widget to work with secured services
	token: null,
	
	// outFields: String[]
	//      The outFields parameter in the esri.tasks.Query.
	//      If set to null, then only the searchField will be added.
	outFields: null,
	
	
	constructor: function(params, div) {
		// summary:
		//		Constructor method
		// params: Object
		//		Parameters to pass into the widget. map, promptMessage, mapServiceURL,
		//		searchLayerIndex, and searchField are required. All others are optional.
		// div: String|DomNode
		//		A reference to the div that you want the widget to be created in.
		console.log(this.declaredClass + '::' + arguments.callee.nom);
	},
	
	postCreate: function() {
		// summary:
		//		Overrides method of same name in dijit._Widget.
		// tags:
		//		private
		console.log(this.declaredClass + '::' + arguments.callee.nom);
		
		this._setUpQueryTask();
		
		this._wireEvents();
		
		this._setUpGraphicsLayer();
		
		this.inherited(arguments);
	},
	
	_setUpQueryTask: function() {
		// summary:
		//		Sets up the esri QueryTask.
		// tags:
		//		private
		console.log(this.declaredClass + "::" + arguments.callee.nom);
		
		// create new query parameter
		this.query = new esri.tasks.Query();
		this.query.returnGeometry = false;
		this.query.outFields = this.outFields || [this.searchField];
		
		// create new query task
		var url = (this.token) ? this.mapServiceURL + "/" + this.searchLayerIndex + '/?token=' + this.token : 
			this.mapServiceURL + "/" + this.searchLayerIndex;
		this.queryTask = new esri.tasks.QueryTask(url);
		
		// wire events
		this.connect(this.queryTask, 'onError', this._onQueryTaskError);
	},
	
	_setUpGraphicsLayer: function(){
		// summary:
		//		Sets up the graphics layer and associated symbols.
		// tags:
		//		private
		console.log(this.declaredClass + "::" + arguments.callee.nom);
		
		var that = this;
		function afterMapLoaded(){
			that._graphicsLayer = new esri.layers.GraphicsLayer();
			that.map.addLayer(that._graphicsLayer);
			
			// wire clear graphics event
			dojo.connect(that.map, "onExtentChange", dojo.hitch(that, function(){
				if (that._addingGraphic === false) {
					that._graphicsLayer.clear();
				}
				that._addingGraphic = false;
			}));
		}
		
		// create new graphics layer and add to map
		if (this.map.loaded) {
			afterMapLoaded();
		} else {
			this.connect(this.map, 'onLoad', afterMapLoaded);
		}

		// set up new symbols
		this.symbolFill = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_NULL, 
			new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT, 
			new dojo.Color([255,255,0]), 1.5), null);
		this.symbolLine = new esri.symbol.SimpleLineSymbol() 
			.setColor(new dojo.Color([255, 255, 0]))
			.setWidth(5);
		this.symbolPoint = new esri.symbol.SimpleMarkerSymbol().setColor([255,255,0,0.5]).setSize(10);
	},
	
	_wireEvents: function() {
		// summary:
		//		Wires events.
		// tags:
		//		private
		console.log(this.declaredClass + "::" + arguments.callee.nom);
		
		this.connect(this.textBox, 'onKeyUp', this._onTextBoxKeyUp);
		this.connect(this.textBox, 'onBlur', function(){
			// don't hide table if the cursor is over it
			if (!this._isOverTable){
				// hide table
				this._toggleTable(false);
			}
		});
		this.connect(this.textBox, 'onFocus', function(){
			this._startSearchTimer();
		});
		this.connect(this.matchesTable, 'onmouseenter', dojo.hitch(this, function(){
			// set switch
			this._isOverTable = true;
			
			// remove any rows selected using arrow keys
			dojo.query('.selected-cell').removeClass('selected-cell');
			
			// reset current selection
			this._currentIndex = 0;
		}));
		this.connect(this.matchesTable, 'onmouseleave', dojo.hitch(this, function(){
			// set switch
			this._isOverTable = false;
			
			// set first row as selected
			dojo.addClass(this.matchesTable.rows[0].cells[0], 'selected-cell');
		}));
	},
	
	_onTextBoxKeyUp: function(event) {
		// summary:
		//		Handles the text box onKeyUp event.
		// tags:
		//		private
		console.log(this.declaredClass + "::" + arguments.callee.nom);
		
		if (event.keyCode === dojo.keys.ENTER){
			// zoom if there is at least one match
			if (this.matchesTable.rows.length > 0) {
				this._setMatch(this.matchesTable.rows[this._currentIndex]);
			} else {
				// search
				this._search(this.textBox.textbox.value);
			}
		} else if (event.keyCode === dojo.keys.DOWN_ARROW) {
			this._moveSelection(1);
		} else if (event.keyCode === dojo.keys.UP_ARROW) {
			this._moveSelection(-1);
		} else {
			this._startSearchTimer();
		}
	},
	
	_startSearchTimer: function(){
		// summary:
		//		Sets a timer before searching so that the search function
		//		isn't called too many times.
		// tags:
		//		private
		// set timer so that it doesn't fire repeatedly during typing
		clearTimeout(this._timer);
		this._timer = setTimeout(dojo.hitch(this, function(){
			this._search(this.textBox.textbox.value);
		}), 250);
	},
	
	_moveSelection: function(increment){
		// summary:
		//		Moves the selected row in the results table based upon
		//		the arrow keys being pressed.
		// increment: Number
		//		The number of rows to move. Positive moves down, negative moves up.
		// tags:
		//		private
		console.log(this.declaredClass + "::" + arguments.callee.nom, arguments);

		// exit if there are no matches in table
		if (this.matchesTable.rows.length === 0){
			this._startSearchTimer();
			return;
		}

		// remove selected class if any
		dojo.removeClass(this.matchesTable.rows[this._currentIndex].cells[0], 'selected-cell');

		// increment index
		this._currentIndex = this._currentIndex + increment;
		
		// prevent out of bounds index
		if (this._currentIndex < 0){
			this._currentIndex = 0;
		} else if (this._currentIndex > this.matchesTable.rows.length -1){
			this._currentIndex = this.matchesTable.rows.length - 1;
		}
		
		// add selected class using new index
		dojo.addClass(this.matchesTable.rows[this._currentIndex].cells[0], 'selected-cell');
	},
	
	_onQueryTaskError: function(error) {
		// summary:
		//		Handles when there is an error returned from the query task.
		// error: Error
		//		The error object returned from the query task.
		// tags:
		//		private
		console.log(this.declaredClass + "::" + arguments.callee.nom);

		// swallow errors from cancels
		if (error.message != 'undefined') {
			throw new Error(this.declaredClass + " ArcGISServerError: " + error.message);
		}
		
		if (this.map.hideLoader) {
			this.map.hideLoader();
		}
	},
	
	_search: function(searchString) {
		// summary:
		//		Performs a search with the QueryTask using the passed in string.
		// searchString: String
		//		The string that is used to construct the LIKE query.
		// tags:
		//		private
		console.log(this.declaredClass + "::" + arguments.callee.nom);
		
		// clear table
		this._deleteAllTableRows(this.matchesTable);
		
		// return if not enough characters
		if (searchString.length < 1) {
			this._deleteAllTableRows(this.matchesTable);
			//			this.textBox.displayMessage("please type at least 2 characters...");
			return;
		}
		
		if (this.map.showLoader) {
			this.map.showLoader();
		}
		
		// update query where clause
		this.query.where = "UPPER(" + this.searchField + ") LIKE UPPER('" + searchString + "%')";
		
		// execute query / canceling any previous query
		if (this._deferred) {
			this._deferred.cancel();
		}
		this._deferred = this.queryTask.execute(this.query, dojo.hitch(this, function(featureSet){
			this._processResults(featureSet.features);
		}));
	},
	
	_processResults: function(features){
		// summary:
		//		Processes the features returned from the query task.
		// features: Object[]
		//		The features returned from the query task.
		// tags:
		//		private
		console.log(this.declaredClass + "::" + arguments.callee.nom);
		
		try {
			console.info(features.length + " search features found.");
			
			// remove duplicates
			features = this._removeDuplicateResults(features);

			// get number of unique results
			var num = features.length;
			console.info(num + " unique results.");
			
			// return if too many values or no values
			if (num > this.maxResultsToDisplay) {                
				this.textBox.displayMessage("More than " + this.maxResultsToDisplay + " matches found. Keep typing...");
			} else if (num === 0) {                
				this.textBox.displayMessage("There are no matches.");
			} else {
				this.textBox.displayMessage("");
				
				this._populateTable(features);
			}
		} catch (e) {
			throw new Error(this.declaredClass + "_processResults: " + e.message);
		}
		
		if (this.map.hideLoader) {
			this.map.hideLoader();
		}
	},
	
	_removeDuplicateResults: function(features){
		// summary:
		//		Removes duplicates from the set of features.
		// features: Object[]
		//		The array of features that need to be processed.
		// returns: Object[]
		//		The array after it has been processed.
		// tags:
		//		private
		
		var list = [];
		dojo.forEach(features, function(f, idx, array){
			if (dojo.some(list, function(existingF){
				if (existingF.attributes[this.searchField] === f.attributes[this.searchField]){
					return true; // there is a match
				}
			}, this) === false){
				// add item
				list.push(f);
			}
		}, this);
		return list;
	},
	
	_populateTable: function(features){
		// summary:
		//		Populates the autocomplete table.
		// features: Object[]
		//		The array of features to populate the table with.
		// tags:
		//		private
		console.log(this.declaredClass + "::" + arguments.callee.nom);
		
		features = this._sortArray(features);
		
		// loop through all features
		dojo.forEach(features, function(feat, i){
			// insert new empty row
			var row = this.matchesTable.insertRow(i);
			
			// insert match value cell
			var matchCell = row.insertCell(0);
			
			// get match value string and bold the matching letters
			var fString = feat.attributes[this.searchField];
			var sliceIndex = this.textBox.textbox.value.length;
			matchCell.innerHTML = fString.slice(0, sliceIndex) + fString.slice(sliceIndex).bold();
			
			// wire onclick event
			this.connect(row, "onclick", this._onRowClick);
		}, this);
		
		// select first row
		dojo.addClass(this.matchesTable.rows[0].cells[0], 'selected-cell');
		
		// show table
		this._toggleTable(true);
		
		// update message
		this.textBox.displayMessage("Click on a result to zoom to it.");
	},
	
	_onRowClick: function(event){
		// summary:
		//		Handles when someone clicks on the a row in the autocomplete
		//		table.
		// event: Event
		//		The event object.
		// tags:
		//		private
		console.log(this.declaredClass + "::" + arguments.callee.nom);
		
		this._setMatch(event.currentTarget);
	},
	
	_setMatch: function(row){
		// summary:
		//		Sets the passed in row as a match in the text box and 
		//		zooms to the feature.
		// row: Object
		//		The row object that you want to set the textbox to.
		// tags:
		//		private
		console.log(this.declaredClass + "::" + arguments.callee.nom);

		// clear prompt message
		this.textBox.displayMessage("");

		// clear any old graphics
		this._graphicsLayer.clear();
		
		// set textbox to full value
		var cell = row.cells[0];
		// textContent is the standard supported by everyone but < IE9.
		// https://developer.mozilla.org/en/DOM/Node.textContent
		this.textBox.textbox.value = (dojo.isIE < 9) ? cell.innerText : cell.textContent;
		
		// clear table
		this._toggleTable(false);
					
		// switch to return geometry and build where clause
		this.query.returnGeometry = true;
		this.query.where = this.searchField + " = '" + this.textBox.textbox.value + "'";
		this.queryTask.execute(this.query, dojo.hitch(this, function(featureSet){	
			// set switch to prevent graphic from being cleared
			this._addingGraphic = true;
		
			if (featureSet.features.length === 1 || featureSet.features[0].geometry.type === 'polygon'){
				this._zoom(featureSet.features[0]);
			} else {
				this._zoomToMultipleFeatures(featureSet.features);
			}
					
			// set return geometry back to false
			this.query.returnGeometry = false;
		}));
	},
	
	_zoom: function(graphic){
		// summary:
		//		Zooms to the passed in graphic.
		// graphic: esri.Graphic
		//		The esri.Graphic that you want to zoom to.
		// tags:
		//		private
		console.log(this.declaredClass + "::" + arguments.callee.nom);
		
		var sym;
		
		// check for point feature
		if (graphic.geometry.type === 'point'){
			// zoom and center on point
			// TODO: this will not work for a map that does not have a cached service in it
			
			// get base layer
			var bLayer = this.map.getLayer(this.map.layerIds[0]);
			
			// get next to lowest lod
			var lod = bLayer.tileInfo.lods.length - this.zoomLevel;
			
			this.map.centerAndZoom(graphic.geometry, lod);
			
			sym = this.symbolPoint;
		} else {
			// zoom to feature
			this.map.setExtent(graphic.geometry.getExtent(), true);
			
			sym = (graphic.geometry.type === 'polyline') ? this.symbolLine : this.symbolFill;
		}
		// add graphic
		graphic.setSymbol(sym);
		this._graphicsLayer.add(graphic);
		
		dojo.publish('agrc.widgets.locate.MagicZoom.onZoom');
		this.onZoomed(graphic);
	},
	
	onZoomed: function(graphic){
		// summary:
		//      Fires after the map has been zoomed to the graphic.
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
	},
	
	_deleteAllTableRows: function(table){
		// summary:
		//		Deletes all of the rows in the table.
		// table: Object
		//		The table that you want to act upon.
		// tags:
		//		private
		console.log(this.declaredClass + "::" + arguments.callee.nom);

		// delete all rows in table
		for (var i = table.rows.length; i > 0; i--) {
			table.deleteRow(i - 1);
		}
		
		// hide table
		dojo.style(table, "display", "none");
		
		// reset current index
		this._currentIndex = 0;
	},
	
	_toggleTable: function(show){
		// summary:
		//		Toggles the visibility of the autocomplete table.
		// show: Boolean
		//		If true, table is shown. If false, table is hidden.
		// tags:
		//		private
		console.log(this.declaredClass + "::" + arguments.callee.nom);
		
		var table = (dojo.isIE == 7) ? 'block' : 'table';
		
		var displayValue = (show) ? table : 'none';
		dojo.style(this.matchesTable, 'display', displayValue);
	},
	
	_sortArray: function(array){
		console.log(this.declaredClass + "::" + arguments.callee.nom);

		// custom sort function
		var that = this;
		function sortFeatures(a, b) {
			if (a.attributes[that.searchField] < b.attributes[that.searchField]) {
				return -1;
			} else {
				return 1;
			}
		}
		
		// sort features
		return array.sort(sortFeatures);
	},
	
	_zoomToMultipleFeatures: function(features){
		// summary:
		//		Creates a multi point from features and zooms to that.
		// features: Object[]
		//		Array of features that you want to zoom to.
		// tags:
		//		private
		console.log(this.declaredClass + "::" + arguments.callee.nom);
		
		var that = this;
		function makeMultipoint(){
			var multiPoint = new esri.geometry.Multipoint(that.map.spatialReference);
			dojo.forEach(features, function(f){
				// add to mulipoint
				multiPoint.addPoint(f.geometry);
				
				// set symbol
				f.setSymbol(that.symbolPoint);
				
				// add to graphics layer
				that._graphicsLayer.add(f);
			});
			return multiPoint.getExtent();
		}
		
		function unionExtents(){
			var extent;
			dojo.forEach(features, function(f){
				if (!extent){
					extent = f.geometry.getExtent();
				} else {
					extent.union(f.geometry.getExtent());
				}
				
				var sym = (f.geometry.type === 'polyline') ? that.symbolLine : that.symbolFill;
				f.setSymbol(sym);
				
				that._graphicsLayer.add(f);
			});
			return extent;
		}
		
		var extent = (features[0].geometry.type === 'point') ? makeMultipoint() : unionExtents();

		this.map.setExtent(extent, true);
		
		dojo.publish('agrc.widgets.locate.MagicZoom.onZoom');
	},
	
	destroyRecursive: function(preserveDom){
		// summary:
		//     Overridden from dijit._Widget. Removes graphics layer from map.
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
		
		this.map.removeLayer(this._graphicsLayer);
		
		this.inherited(arguments);
	}
});