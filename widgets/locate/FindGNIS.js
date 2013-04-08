/*global dojo, console, agrc, dijit, esri*/
//provide namespace
dojo.provide("agrc.widgets.locate.FindGNIS");

dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dijit.form.Button');
dojo.require('dijit.form.FilteringSelect');
dojo.require('dojo.data.ItemFileReadStore');

dojo.declare("agrc.widgets.locate.FindGNIS", [dijit._Widget, dijit._Templated], {
	// description:
	//		**Summary**: A simple form tied to the map allowing a user to quickly zoom to a GNIS 
	//		feature. 
	//		<p>
	//		**Owner(s)**: Scott Davis
	//		</p>
	//		<p>
	//		**Test Page**: <a href='/tests/dojo/agrc/1.0/agrc/widgets/tests/FindGNISTests.html' target='_blank'>
	//			agrc.widgets.map.FindGNIS.Tests</a>
	//		</p>
	//		<p>
	//		**Description**:
	//		This is intended to be a temporary work-around to the problem that the FindGeneric
	//		widget has with large datasets.
	//		</p>
	//		<p>
	//		**Published Topics**:
	//		</p>
	//		<ul><li>None</li>
	//		</ul>
	//		**Exceptions**:
	//		</p>
	//		<ul><li>agrc.widgets.locate.FindGNIS NullReferenceException: map. Pass the map in the constructor.</li></ul>
	//		<p>
	//		**Required Files**: 
	//		</p>
	//		<ul><li>agrc/themes/standard/locate/FindGNIS.css</li></ul>
	//		
	// example:
	// |	new agrc.widgets.locate.FindGNIS({
	// |		map: map,
	// |	}, 'test2');

	// widgetsInTemplate: [private] Boolean
	//		Specific to dijit._Templated.
	widgetsInTemplate: true,

	// templatePath: [private] String
	//		Path to template. See dijit._Templated
	templatePath: dojo.moduleUrl("agrc.widgets.locate.templates", "FindGNIS.html"),

	// _searchUrl: [private] String
	//		the url to the agrc map service that the validation text box points at;
	_searchUrl: 'http://mapserv.utah.gov/WSUT/Dojo.svc/GNIS?Value=',

	// _envelopeUrl: [private] String
	//		The url to the agrc map service that returns the feature envelope.
	_envelopeUrl: 'http://mapserv.utah.gov/WSUT/FeatureGeometry.svc/GetEnvelope/find-gnis-widget/layer(SGID93.LOCATION.PlaceNamesGNIS2000)where(NAME)(=)(searchValue)quotes=true',

	// _isOverTable: Boolean
	//		switch to help with onBlur callback on search box
	_isOverTable: false,

	// _timer: Object
	//		timer to delay the search so that it doesn't fire too many times when typing quickly
	_timer: null,

	// searchFieldName: String
	//		The field that you want the validation text box to search (ie. NAME).
	searchField: 'NAME',

	// Parameters to constructor

	// maxResultsToDisplay: Number
	//		The maximum number of matchs to display in the drop-down.
	maxResultsToDisplay: 10,

	// map: esri.Map
	//		Reference to esri.Map
	map: null,

	constructor: function (params, div) {
		// summary:
		//		Constructor method
		// params: Object
		//		Parameters to pass into the widget. Includes map and optionally maxResultsToDisplay.
		// div: String|DomNode
		//		A reference to the div that you want the widget to be created in.
		console.log(this.declaredClass + '::' + arguments.callee.nom, arguments);
	},

	postCreate: function () {
		// summary:
		//		Overrides method of same name in dijit._Widget.
		// tags:
		//		private
		console.log(this.declaredClass + "::" + arguments.callee.nom, arguments);

		// check for map
		if (!this.map) {
			throw new Error(this.declaredClass + " NullReferenceException: map.  Pass the map in the constructor.");
		}

		this._setUpGetParameters();

		this._wireEvents();
	},

	_setUpGetParameters: function () {
		// summary:
		//		Sets up the ajax request parameters object
		// tags:
		//		private
		console.log(this.declaredClass + "::" + arguments.callee.nom, arguments);

		this.getParams = {
			callbackParamName: "callback",
			handleAs: "json",
			load: dojo.hitch(this, function (result, ioArgs) {
				this.processResults(result.items);
			}),
			error: dojo.hitch(this, function (error) {
				throw new Error("There has been an error with ArcGIS Server.\n" + error.message);
			})
		};
	},

	_wireEvents: function () {
		// summary:
		//		Wire events.
		// tags:
		//		private
		console.log(this.declaredClass + "::" + arguments.callee.nom, arguments);

		this.connect(this.txt_box, "onKeyUp", this._checkEnter);
		this.connect(this.findbtn, "onClick", this._zoom);
		this.connect(this.txt_box, 'onBlur', function () {
			// don't hide table if the cursor is over it
			if (!this._isOverTable) {
				// hide table
				this.toggleTable(false);
			}
		});
		this.connect(this.matchesTable, 'onmouseenter', function () {
			this._isOverTable = true;
		});
		this.connect(this.matchesTable, 'onmouseleave', function () {
			this._isOverTable = false;
		});
	},

	_checkEnter: function (event) {
		// summary:
		//		Checks to see if the Enter key was pressed and zooms if it was pressed.
		// tags:
		//		private
		//		console.log(this.declaredClass + "::" + arguments.callee.nom, arguments);

		// zoom on Enter key
		if (event.keyCode == 13) {
			this.zoom();
		} else if (this.txt_box.textbox.value.length > 2) {
			// set timer so that it doesn't fire repeatedly during typing
			clearTimeout(this._timer);
			this._timer = setTimeout(dojo.hitch(this, function () {
				this._refreshStoreForTextBox();
			}), 300);
		}
	},

	_zoom: function () {
		// summary:
		//		Zooms to the current feature.
		// tags:
		//		private
		console.log(this.declaredClass + "::" + arguments.callee.nom, arguments);

		if (this.txt_box.isValid()) {
			// set up url
			var url = this._envelopeUrl.replace('searchValue', this.txt_box.textbox.value);

			dojo.io.script.get({
				callbackParamName: 'callback',
				url: url,
				handleAs: 'json',
				load: dojo.hitch(this, function (ResultObj, ioArgs) {
					// get first result
					var ext = ResultObj.Results[0];

					// create new point
					var pnt = new esri.geometry.Point(ext.MinX, ext.MinY,
						new esri.SpatialReference({ wkid: 26912 }));

					this.map.centerAndZoom(pnt, 10);
				})
			});
		}
	},

	_refreshStoreForTextBox: function () {
		// summary:
		//		Fires the ajax request for a new set of features.
		// tags:
		//		private
		console.log(this.declaredClass + "::" + arguments.callee.nom, arguments);

		// clear table
		this.deleteAllTableRows(this.matchesTable);

		// update url with search term
		this.getParams.url = this._searchUrl + this.txt_box.textbox.value;

		dojo.io.script.get(this.getParams);
	},

	deleteAllTableRows: function () {
		// summary:
		//		Clears out the results table.
		console.log(this.declaredClass + '::' + arguments.callee.nom, arguments);

		// delete all rows in table
		for (var i = this.matchesTable.rows.length; i > 0; i--) {
			this.matchesTable.deleteRow(i - 1);
		}

		// hide table
		dojo.style(this.matchesTable, "display", "none");
	},

	processResults: function (features) {
		// summary:
		//		Checks the number of features returned and calls populateTable if appropriate
		// features: Array
		//		The array of returned features from the ajax request.
		console.log(this.declaredClass + '::' + arguments.callee.nom, arguments);

		// get number of features returned
		var num = features.length;
		console.info(num + " search features found.");

		// check number of features
		if (num === 0) {
			this.txt_box.displayMessage("There are no matches.");
		} else {
			this.txt_box.displayMessage("");

			this.populateTable(features);
		}
	},

	populateTable: function (features) {
		// summary:
		//		Populates the matches table.
		// features: Array
		//		Array of features that the table is to be populated with.
		console.log(this.declaredClass + '::' + arguments.callee.nom, arguments);

		// loop through all features
		dojo.some(features, function (feat, i) {
			// insert new empty row
			var row = this.matchesTable.insertRow(i);

			// insert match value cell
			var matchCell = row.insertCell(0);

			// get match value string and bold the matching letters
			var fString = feat.Value;
			var sliceIndex = this.txt_box.textbox.value.length;
			matchCell.innerHTML = fString.slice(0, sliceIndex) + fString.slice(sliceIndex).bold();

			// create hidden cell to hold unformatted value            
			var valueCell = row.insertCell(1);
			dojo.addClass(valueCell, 'hidden-cell');
			valueCell.innerHTML = fString;

			// wire onclick event
			this.connect(row, "onclick", this._onRowClick);

			// return only first max items
			return i >= this.maxResultsToDisplay;
		}, this);

		// show table
		this.toggleTable(true);
	},

	toggleTable: function (show) {
		// summary:
		//		Toggles the visibility of the matches table.
		// show: Boolean
		//		True = show table, False = hide table.
		console.log(this.declaredClass + "::" + arguments.callee.nom);

		var buttonDisplayValue = (!show) ? 'block' : 'none';
		dojo.style(this.findbtn.domNode, 'display', buttonDisplayValue);

		var displayValue = (show) ? 'table' : 'none';
		dojo.style(this.matchesTable, 'display', displayValue);
	},

	_onRowClick: function (event) {
		// summary:
		//		Handles when a row in the matches table is clicked
		// event: EventObject
		//		
		console.log(this.declaredClass + "::" + arguments.callee.nom, arguments);

		// set text box to value of clicked cell
		this.txt_box.textbox.value = event.currentTarget.cells[1].innerHTML;

		this.toggleTable(false);

		this.deleteAllTableRows();
	}
});
