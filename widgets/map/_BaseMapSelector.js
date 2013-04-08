/*global dojo, console, agrc, dijit, esri*/
// provide namespace
dojo.provide('agrc.widgets.map._BaseMapSelector');

// dojo widget requires
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');

// other dojo requires
dojo.require('agrc.widgets.map.ThemeInfo');

dojo.declare('agrc.widgets.map._BaseMapSelector', [dijit._Widget, dijit._Templated], {
	// description:
	//		**Summary**: A base class to orchestrate the changing of basemaps/themes.
	//		<p>
	//		**Owner(s)**: Steve Gourley, Scott Davis
	//		</p>
	//		<p>
	//		**Description**:
	//		Has all the core functionality to swap ThemeInfos
	//		</p>
	//		<p>
	//		**Published Topics**:
	//		</p>
	//		<ul><li>agrc.widgets.map.BaseMapSelector.onChangeTheme_" + this.id[Current Theme Info]</li></ul>
	//		<p>
	//			**Exceptions**:
	//		</p>
	//		<ul><li>NullReferenceException: theme.  Theme name not found</li></ul>
	//		<p>
	//		**Required Files**:
	//		</p>
	//		<ul><li>None</li></ul>

	// map: [public] esri.Map
	//		This widget needs a reference to a map to be able to load and swap ThemeInfos
	map: null,

	// themeInfos: [public] agrc.widgets.map.ThemeInfo[]
	//		User passed in layers, set in constructor to avoid prototype memory sharing across instances
	themeInfos: null,

	// currentTheme: [public] a reference to the current ThemeInfo
	//		holds the current themeInfo
	currentTheme: null,

	// defaultThemeLabel: [public] String
	//		The default ThemeInfo string label for initializing the default ThemeInfo.
	defaultThemeLabel: null,

	// data: [public] agrc.widgets.map.ThemeInfo[]
	//		Holds the default themes. Contains all agrc basemap services.
	data: null,

	constructor: function (args) {
		// summary: 
		//		Constructor function for object
		// args: Object?
		//		The parameters that you want to pass into the object. Includes: map: agrc.widgets.map.BaseMap || esri.Map || anything that inherits from esri.Map
		//		The esri.Map object for switching the base map on, defaultThemeLabel and themeInfos
		console.info("agrc.widgets.map._BaseMapSelector::" + arguments.callee.nom);

		this.themeInfos = [];
		this.currentTheme = {};
		this.data = [];
	},

	postMixInProperties: function () {
		// summary:
		//       
		// description:
		//      i am a property
		// tags:
		//      public
		// returns:
		//       
		console.info(this.declaredClass + "::" + arguments.callee.nom);
		
		if (!this.data || this.data.length === 0) {
			this.data = dojo.fromJson(dojo.cache('agrc.widgets.map.data', 'defaultThemeInfos.js'));
		}

		if (!this.defaultThemeLabel) {
			this.defaultThemeLabel = "Terrain";
		}
	},

	postCreate: function () {
		// summary: 
		//      Sets up the widget
		// description:
		//      If the themeInfos being sent in are empty loads the default agrc themes.
		// tags:
		//      protected
		console.info("agrc.widgets.map._BaseMapSelector::" + arguments.callee.nom);

		if (this.themeInfos.length === 0) {
			this.loadDefaultThemes(this.data);
		}
	},

	loadDefaultThemes: function (data) {
		// summary: 
		//      Takes the data in the data property and calls addTheme on them.
		// description:
		//      Parses the data object into theme info's and sets up the current theme.  Also adds the first theme to the map.
		// example:
		// |	data = [{
		// |		"label": "label",
		// |		"layers": [
		// |			{
		// |				"url": "http://.../MapServer",
		// |				"opacity": 1
		// |			}
		// |		]
		// |	},...]
		// tags:
		//      public
		// data: json object - see example

		console.info("agrc.widgets.map._BaseMapSelector::" + arguments.callee.nom);

		// load default themes
		if (data) {
			dojo.forEach(data, function (basemap) {
				// create new themeInfo from basemap
				var layersArray = [];
				dojo.forEach(basemap.layers, function (layer) {
					layersArray.push(new esri.layers.ArcGISTiledMapServiceLayer(layer.url, {
						id: basemap.label,
						opacity: layer.opacity
					}));
				}, this);

				this.addTheme(new agrc.widgets.map.ThemeInfo({
					label: basemap.label,
					layers: layersArray
				}));
			}, this);
		}

		this.currentTheme = this._getTheme(this.defaultThemeLabel).themeInfo;

		// add first layer to map
		this.changeTheme(this.currentTheme.label);
	},

	changeTheme: function (newThemeLabel) {
		// summary: 
		//      Swaps themes
		// description:
		//      Changes ThemeInfos. Publishes onChangeTheme.  See Publishing and Events 
		// tags:
		//      public
		// returns: agrc.widgets.map.ThemeInfo
		//       The new themeInfo object.
		console.info("agrc.widgets.map._BaseMapSelector::" + arguments.callee.nom);

		// return if this is already the current theme and it's loaded
		if (newThemeLabel === this.currentTheme.label && this.map.layerIds.length > 0) {
			return this.currentTheme;
		}

		// remove old theme layers from map
		dojo.forEach(this.currentTheme.layers, function (esriLayer) {
			if (esriLayer) {
				this.map.removeLayer(esriLayer);
			}
		}, this);

		// get new theme
		var newTheme = this._getTheme(newThemeLabel);

		// update current theme
		this.currentTheme = newTheme.themeInfo;

		// add layers to map
		dojo.forEach(newTheme.themeInfo.layers, function (layer) {
			this.map.addLayer(layer, 0);
		}, this);

		dojo.publish("agrc.widgets.map.BaseMapSelector.onChangeTheme_" + this.id, [this.currentTheme]);

		return newTheme;
	},

	addTheme: function (newThemeInfo) {
		// summary: 
		//      Adds a new theme info to the array
		// description:
		//      Pushes the new themeinfo into the themeInfos object
		// newThemeInfo: agrc.widgets.map.ThemeInfo
		//		The new theme info to add to the array.
		// tags:
		//      public
		console.info("agrc.widgets.map._BaseMapSelector::" + arguments.callee.nom);

		this.themeInfos.push(newThemeInfo);
	},

	_getTheme: function (label) {
		// summary: 
		//      Gets the themeinfo with the current label test
		// description:
		//      Searches the themeInfos to find where theme.label matches the input label.
		// label: String
		//		The string label that identifies the theme info.
		// tags:
		//      private
		// returns: Object
		//      An object containign themeinfo: ThemeInfo and index the index of the themeinfo in the array.

		console.info("agrc.widgets.map._BaseMapSelector::" + arguments.callee.nom);
		var themeArgs;

		dojo.some(this.themeInfos, function (theme, index) {
			if (theme.label === label) {
				themeArgs = {
					'themeInfo': theme,
					'index': index
				};

				return true;
			} else {
				return false;
			}
		}, this);

		if (!themeArgs) {
			throw new Error(this.declaredClass + " NullReferenceException: theme.  Theme name not found " + label + ".");
		}
		return themeArgs;
	}
});