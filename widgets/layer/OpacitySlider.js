/*global dojo, console, agrc, dijit*/
// provide namespace
dojo.provide('agrc.widgets.layer.OpacitySlider');

// dojo widget requires
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');

// other dojo requires

dojo.declare('agrc.widgets.layer.OpacitySlider', [dijit._Widget, dijit._Templated], {
    // description:
	//		**Summary**: Slider bar to control layer opacity.
	//		<p>
	//		**Owner(s)**: Scott Davis
	//		</p>
	//		<p>
	//		**Test Page**: <a href='/tests/dojo/agrc/1.0/agrc/widgets/tests/OpacitySliderTests.html' target='_blank'>
	//			agrc.widgets.layer.OpacitySlider.Tests</a>
	//		</p>
	//		<p>
	//		**Description**:
    //		Dynamically controls the opacity of the passed in layer with a slider bar. Note: This widget
	//		requires compatibility mode to be turned on in IE 8. See the example for the meta tag.
	//		</p>
	//		<p>
	//		**Published Channels/Events**:
	//		</p>
	//		<ul><li>None</li>
	//		</ul>
	//		<p>
	//		**Exceptions**:
	//		</p>
	//		<ul><li>None</li></ul>
	//		<p>
	//		**Required Files**:
	//		</p>
	//		<ul><li>agrc/themes/standard/layer/OpacitySlider.css</li></ul>
    // example:
	// |	<meta http-equiv="X-UA-Compatible" content="IE=7" />
    // |	var widget = new agrc.widgets.layer.OpacitySlider({mapServiceLayer: lyr}, 'test-div');
    
    // widgetsInTemplate: [private] Boolean
	//		Specific to dijit._Templated.
    widgetsInTemplate: true,
	
	// templatePath: [private] String
	//		Path to template. See dijit._Templated
    templatePath: dojo.moduleUrl("agrc.widgets.layer", "templates/OpacitySlider.html"),
    
	// Parameters to constructor
	
	// mapServiceLayer: esri.layer
	//		Reference to the esri.layer that you want the slider to be connected to
	mapServiceLayer: null,
	
	// displayLegend: Boolean
	//		Controls whether the legend div is displayed or not.
	displayLegend: false,
	
    constructor: function(params, div){
        // summary:
		//		Constructor method
		// params: Object
		//		Parameters to pass into the widget. Must specify mapServiceLayer.
		//		Optionally specify displayLegend.
		// div: String|DomNode
		//		A reference to the div that you want the widget to be created in.
		console.log(this.declaredClass + '::' + arguments.callee.nom, arguments);
    },
    
    postCreate: function(){
		// summary:
		//		Overrides method of same name in dijit._Widget.
		// tags:
		//		private
        console.log(this.declaredClass + '::' + arguments.callee.nom, arguments);
		
		if (this.displayLegend){
			dojo.style(this.legend, 'display', 'block');
		}
		
		// set slider value to layer opacity value
		this.slider.set('value', this.mapServiceLayer.opacity);
		
		this._updateLegendOpacity();
		
		this._wireEvents();
    },
	
	_wireEvents: function(){
		// summary:
		//		Wire events.
		// tags:
		//		private
		console.log(this.declaredClass + "::" + arguments.callee.nom, arguments);
		
		this.connect(this.slider, 'onChange', this._onSliderChange);
	},
	
	_onSliderChange: function(newValue){
		// summary:
		//		Handles when the slider's value is changed.
		//		Update the map service opacity and legend opacity
		// tags:
		//		private
//		console.log(this.declaredClass + '::' + arguments.callee.nom, arguments);
		
		this.mapServiceLayer.setOpacity(newValue, true);
		
		this._updateLegendOpacity();
	},
	
	_updateLegendOpacity: function(){
		// summary:
		//		Updates the legend box opacity to match the mapServiceLayer's opacity
		// tags:
		//		private
//		console.log(this.declaredClass + '::' + arguments.callee.nom, arguments);
		
		dojo.style(this.legend, 'opacity', this.mapServiceLayer.opacity);
	}
});