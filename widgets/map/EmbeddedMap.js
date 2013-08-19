// provide namespace
dojo.provide('agrc.widgets.map.EmbeddedMap');

// dojo widget requires
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');

// other dojo requires
dojo.require('agrc.widgets.map.BaseMap');

dojo.declare('agrc.widgets.map.EmbeddedMap', [dijit._Widget, dijit._Templated], {
    // description:
	//		**Summary**: Takes the name of a current embeddable map and load it's 
	//		associated layers. Used with EmbeddedMapLoader.js to easily embed a 
	//		map in a webpage.
	//		<p>
	//		**Owner(s)**: Scott Davis
	//		</p>
	//		<p>
	//		**Test Pages**: <a href='/tests/dojo/agrc/1.0/agrc/widgets/tests/EmbeddedMapTests.html' target='_blank'>agrc.widgets.map.EmbeddedMap.Test</a>
	//		<br> <a href='/tests/dojo/agrc/1.0/agrc/widgets/tests/EmbeddedMapLoaderTest.html' target='_blank'>agrc.widgets.map.EmbeddedMapLoader.Test</a>
	//		</p>
	//		<p>
	//		**Description**:
	//		Pass in the name of a map found in embeddedMapInfos.js and it will load it's 
	//		associated layers. This widget also has a loader script that loads everything 
	//		that you need including the esri api and css. See example.
	//		</p>
	//		<p>
	//		**Published Topics**:
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
	//		<ul><li>agrc/themes/standard/map/EmbeddedMap.css</li></ul>
	//
	// example:
	// |	<!-- The div that the widget will be placed within. 
	// |		Make sure that you specify a width, height and a valid mapId.-->
	// |	<div id='agrcEmbeddedMap' dojoType='agrc.widgets.map.EmbeddedMap' style='width: 300px; height 400px;' mapId='utahdfofuelsites'></div>
	// |	
	// |	<!-- This is the JavaScript file that loads the required external JavaScript and CSS files.-->
	// |	<script type='text/javascript' src='http://mapserv.utah.gov/cdn/dojo/agrc/1.0/agrc/widgets/map/EmbeddedMapLoader.js'></script>
    
    // widgetsInTemplate: [private] Boolean
	//		Specific to dijit._Templated.
    widgetsInTemplate: true,
	
	// templatePath: [private] String
	//		Path to template. See dijit._Templated
    templatePath: dojo.moduleUrl("agrc.widgets.map", "templates/EmbeddedMap.html"),
    
	// map: Object
	//		Reference to agrc.widgets.map.BaseMap.
	map: null,
	
	// layers: Object[]
	//		Array of layer infos obtained from embeddableMaps.js
	services: null,

	
	// Parameters to constructor
	
	// mapId: String
	//		The name of the embeddable map that you want load the layers from.
	mapId: '',
	
    constructor: function(params, div){
        // summary:
		//		Constructor method
		// params: Object
		//		Parameters to pass into the widget. Required values include: mapId.
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
		
		this._initMap();
		
		this._wireEvents();
    },
	
	_initMap: function(){
		// summary:
		//		Sets up the agrc.widgets.map.BaseMap.
		// tags:
		//		private
		console.log(this.declaredClass + '::' + arguments.callee.nom, arguments);
		
		// create unqiue id for map div
		this.mapDiv.id = this.id + '_map';
		
		this.map = new agrc.widgets.map.BaseMap(this.mapDiv.id);
		
		if (this.mapId) {
			this.services = this._getEmbeddableMapInfo(this.mapId).services;
			this._addLayers(this.services);
		}
	},
	
	_addLayers: function(services){
		// summary:
		//		Adds all services to the map
		// tags:
		//		private
		console.log(this.declaredClass + '::' + arguments.callee.nom, arguments);

		dojo.forEach(services, function(service){
			// create layer
			var lyr = new service.type(service.url, service.args);
			
			// add to map
			this.map.addLayer(lyr);
		}, this);
	},
	
	_getEmbeddableMapInfo: function(mapId){
		// summary:
		//		Gets the embeddable map object from the external json file.
		// returns: Object
		//		Embeddable map object
		// tags:
		//		private
		console.log(this.declaredClass + '::' + arguments.callee.nom, arguments);
		
		// get all map infos
		var mapInfos = dojo.fromJson(dojo.cache('agrc.widgets.map.data', 'embeddableMapInfos.js'));
		
		// see if there is a match
		var returnValue;
		dojo.some(mapInfos, function(mapInfo){
			if (mapInfo.name === mapId){
				returnValue = mapInfo;
				return true;
			}
		});
		
		if (returnValue) {
			return returnValue;
		} else {
			throw new Error('No match found for mapId: ' + mapId + ' found in embeddableMapInfos.js!');
		}
	},
	
	_wireEvents: function(){
		// summary:
		//		Wire events.
		// tags:
		//		private
		console.log(this.declaredClass + "::" + arguments.callee.nom, arguments);
	}
});