/*global console, dijit, dojo, agrc*/
// provide namespace
dojo.provide('agrc.widgets.map.BaseMapSelector');

// dojo widget requires
//dojo.require('dijit._Widget');
//dojo.require('dijit._Templated');

// other dojo requires
dojo.require('agrc.widgets.map._BaseMapSelector');
dojo.require('dijit.InlineEditBox');
dojo.require('dojo.data.ItemFileReadStore');
dojo.require('dijit.form.ComboBox');

dojo.declare('agrc.widgets.map.BaseMapSelector', [agrc.widgets.map._BaseMapSelector], {
	// description:
	//		**Summary**: A visual widget to change map base maps and themes.
	//		<p>
	//		**Owner(s)**: Steve Gourley
	//		</p>
	//		<p>
	//		**Test Page**: <a href='/tests/dojo/agrc/1.0/agrc/widgets/tests/BaseMapSelectorTests.html' target='_blank'>agrc.widgets.map.BaseMapSelector.Test</a>
	//		</p>
	//		<p>
	//		**Description**:
	//		A widget that when clicked on will shuffle through agrc.widgets.map.ThemeInfos.  There is also a drop down box for selecting specific ThemeInfos
	//		This widget positions itself inside the esri.Map control and can be placed in any corner and has 2 themes.  The themese are controlled by the id property: tundra or claro.
	//		</p>
	//		<p>
	//		**Published Topics**:
	//		</p>
	//		<ul><li>agrc.widgets.map.BaseMapSelector.onChangeTheme_" + this.id[Current Theme Info]</li></ul>
	//		<p>
	//			**Exceptions**:
	//		</p>
	//		<ul><li>agrc.widgets.map.BaseMapSelector NullReferenceException: map.  Pass the map in the constructor.</li></ul>
	//		<p>
	//		**Required Files**:
	//		</p>
	//		<ul><li>agrc/themes/standard/map/BaseMapSelector.css</li></ul>
	// example 1:
	// |	var options = {
	// |		'useDefaultExtent': true,
	// |		'useDefaultBaseMap': false
	// |	};
	// |	
	// |	var map = new agrc.widgets.map.BaseMap('basemap-div', options);
	// |	var selector = new agrc.widgets.map.BaseMapSelector({ map: map, id: "tundra", position: "BL" });
	//
	// example 2 - Alternate default theme:
	// |	this.map = new agrc.widgets.map.BaseMap('map-div', {
    // |        useDefaultBaseMap: false
    // |    });
    // |    var bms = new agrc.widgets.map.BaseMapSelector({
    // |        map: this.map,
    // |        id: 'claro',
    // |        position: 'TR',
    // |        defaultThemeLabel: 'Lite'
    // |    });

	//must be true if you have dijits in your template string
	widgetsInTemplate: true,

	//location of widget template
	templateString: dojo.cache('agrc.widgets.map.templates', 'BaseMapSelectorTemplate.htm'),

	//parent container node
	//selectorContainerNode: dojoattachpoint

	//map widget
	//map: false, baseClass

	// position: String
	//		Where to place the widget inside the map frame: can be TR (top right) BL (bottom left) BR or TL
	position: "TR",

	//themeInfos: [], baseClass

	//currentTheme: {}, baseClass

	// currentIndex: Number
	//		Current index of basemap spinner
	currentIndex: 0,

	// _themeInfoClones: [private] ThemeInfo[]
	//		used so originals are not modified when more than one widget on page
	_themeInfoClones: null,

	// _themeInfoStore: [private] dojo.data.ItemFileReadStore
	//		store for combobox
	_themeInfoStore: {},

	constructor: function (args) {
		// summary:
		//		Constructor function for object. 
		// args: Object?
		//		The parameters that you want to pass into the object. Includes: map: agrc.widgets.map.BaseMap || esri.Map || anything that inherits from esri.Map
		//		The esri.Map object for switching the base map on, id,
		//		position.
		console.info(this.declaredClass + '::' + arguments.callee.nom);
	},

	postCreate: function () {
		// summary:
		//		Sets up the widget
		// description:
		//		Checks for required props, places the widget in the map, clones the theme infos
		//		creates the store for the ComboBox/InlineEdit
		//		inits the theme infos, connects the click events and sets the css class
		console.info(this.declaredClass + "::" + arguments.callee.nom);

		this.inherited(arguments);

		// check for map
		if (!this.map) {
			throw new Error(this.declaredClass + " NullReferenceException: map.  Pass the map in the constructor.");
		}

		dojo.place(this.domNode, this.map.id + '_root', "last");

		this._themeInfoClones = [];

		dojo.forEach(this.themeInfos, function (theme) {
			this._themeInfoClones.push({
				label: dojo.fromJson(dojo.toJson(theme.label))
			});
		}, this);

		this._themeInfoStore = new dojo.data.ItemFileReadStore({
			data: {
				identifier: 'label',
				label: 'label',
				items: this._themeInfoClones
			}
		});

		this.mapLabel = new dijit.InlineEditBox({
			editor: "dijit.form.ComboBox",
			editorParams: {
				store: this._themeInfoStore,
				searchAttr: 'label'
			},
			onChange: dojo.hitch(this, "changeTheme")
		}, this.mapLabel);

		this.initDefaultThemes();

		this.connect(this.selectorContainerNode, 'onclick', this.shuffle);

		dojo.addClass(this.container, this.position);
	},

	initDefaultThemes: function () {
		// summary: 
		//		Sets the widget up to look right for the default theme
		// description:
		//		Sets the map label to the current theme and also the basemap sprite
		// tags:
		//		private
		console.info(this.declaredClass + "::" + arguments.callee.nom);

		this.mapLabel.set('value', this.currentTheme.label);

		dojo.addClass(this.mapIcon, this.currentTheme.label);
	},

	addTheme: function (newThemeInfo) {
		// summary: 
		//      Adds a new theme to the selector
		// description:
		//      pushes the new theme info into the cloned array so the ComboBox stays in sync
		// newThemeInfo: agrc.widgets.map.ThemeInfo
		//		The new theme info to add to the array.
		// tags:
		//      public
		console.info(this.declaredClass + "::" + arguments.callee.nom);

		this.inherited(arguments);

		if (this._themeInfoClones) {
			this._themeInfoClones.push({
				label: newThemeInfo.label
			});
		}
	},

	changeTheme: function (newThemeLabel) {
		// summary: 
		//      Swaps the theme for a new one
		// description:
		//      Modifies the css and label text to match the newTheme props
		//      and actually changes the map theme
		// tags:
		//      public
		// newThemeLabel: agrc.widgets.map.ThemeInfo 
		//       new theme to display
		// returns:
		//      agrc.widgets.map.ThemeInfo
		console.info(this.declaredClass + "::" + arguments.callee.nom);

		// remove thumbnail
		dojo.removeClass(this.mapIcon, this.currentTheme.label);

		var newTheme = this.inherited(arguments);

		this.set('labelText', this.currentTheme.label);

		// add new thumbnail
		dojo.addClass(this.mapIcon, newThemeLabel);

		return newTheme;
	},

	shuffle: function (args) {
		// summary: 
		//      Click event handler for shuffling through themes
		// description:
		//      Handles the plumbing for figuring out which theme index to show next.
		//      Iterates through the array indefinitely
		// tags:
		//      public
		// args: Object?
		//       optional object to pass in args.direction. forward or reverse.

		console.info(this.declaredClass + "::" + arguments.callee.nom);

		this.currentIndex = this._getTheme(this.currentTheme.label).index;

		var direction = args && args.direction || "forward";

		// increment current index by 1 or reset to 0 if it's at the end
		if (direction === "forward") {
			this.currentIndex = this.currentIndex + 1 > this.themeInfos.length - 1 ? 0 : this.currentIndex + 1;
		}
		else {
			this.currentIndex = this.currentIndex - 1 > 0 ? this.currentIndex - 1 : this.themeInfos.length - 1;
		}

		var newTheme = this.changeTheme(this.themeInfos[this.currentIndex].label).themeInfo;

		try { this.mapLabel.set("value", newTheme.label); }
		catch (err) { console.error(err); }
	}
});