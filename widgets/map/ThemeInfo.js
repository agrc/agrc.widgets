/*global console, dojo*/
dojo.provide('agrc.widgets.map.ThemeInfo');

dojo.declare('agrc.widgets.map.ThemeInfo', null, {
	// description:
	//		**Summary**: A class used in the agrc.widgets.map.BaseMapSelector.
	//		<p>
	//		**Owner(s)**: Steve Gourley, Scott Davis
	//		</p>
	//		<p>
	//		**Test Page**: <a href='/tests/dojo/agrc/1.0/agrc/widgets/tests/BaseMapSelectorTests.html' target='_blank'>agrc.widgets.map.BaseMapSelector.Test</a>
	//		</p>
	//		<p>
	//		**Description**:
	//		Contains a label for the unique name of the base map theme and the layers of type esri.layers.layer that are contained in that theme.
	//		</p>
	//		<p>
	//		**Published Channels/Events**:
	//		</p>
	//		<ul><li>None</li></ul>
	//		<p>
	//			**Exceptions**:
	//		</p>
	//		<ul><li>None</li></ul>
	//		<p>
	//		**Required Files**:
	//		</p>
	//		<ul><li>None</li></ul>
	// example:
	// |	var dynamic = new esri.layers.ArcGISDynamicMapServiceLayer("http://../MapServer", {
	// |		opacity: 0.50
	// |	});
	// |	
	// |	var tiled = new esri.layers.ArcGISTiledMapServiceLayer("http://../MapServer");
	// |	
	// |	selector = new agrc.widgets.map.BaseMapSelector({ map: map, id: "tundra", position: "BL" });
	// |	
	// |	var themeInfo = new agrc.widgets.map.ThemeInfo({
	// |		label: 'testCustomTheme',
	// |		layers: [dynamic, tiled]
	// |	});
	// |	
	// |	selector.addTheme(themeInfo);

	// label: [public] String
	//		unique id for the theme. Also shows up as the label for the basemapselect widget.
	label: '',

	// layers: [public] esri.layers.Layer[]
	//		array of esri.layers.Layer ordered from bottom up
    layers: null,

    constructor: function (args) {
		// summary:
		//      Constructor function for object
		// description:
		//      initializes layers array and safeMixin's args
		// tags:
		//      public
		// args: [public] Object?
		//		The optional params to mixin, including layers.
		console.log(this.declaredClass + "::" + arguments.callee.nom);

        this.layers = [];
        dojo.safeMixin(this, args);
    }
});