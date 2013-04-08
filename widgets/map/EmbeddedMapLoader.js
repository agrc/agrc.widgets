(function(){
	var server = 'mapserv.utah.gov';
	
	var head = document.getElementsByTagName('head').item(0);
	
	function loadCss(href){
		// summary:
		//		Adds a css link element to the document head with the 
		//		passed in href
		console.log(this.declaredClass, arguments.callee, arguments);
		
		var link = document.createElement('link');
		link.rel = 'stylesheet';
		link.type = 'text/css';
		link.href = href;
		head.appendChild(link);
	}
	
	function loadJavaScript(src){
		// summary:
		//		Adds a script element to the head with the passed 
		//		in src.
		console.log(this.declaredClass, arguments.callee, arguments);
		
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = src;
		head.appendChild(script);
	}
	
	function initDojo(){
		// get div
		var div = dojo.byId('agrcEmbeddedMap');
		dojo.addClass(div, 'claro');
		
		dojo.require('agrc.widgets.map.EmbeddedMap');
		
		dojo.addOnLoad(function(){
			dojo.parser.parse();
		});
	}
	
	// add meta tag to force IE9 into compatibility mode
	var meta = document.createElement('meta');
	meta.httpEquiv = 'X-UA-Compatible';
	meta.content = 'IE=EmulateIE8';
	head.appendChild(meta);
	
	// load dojo and agrc css
	loadCss('http://serverapi.arcgisonline.com/jsapi/arcgis/2.2/js/dojo/dijit/themes/claro/claro.css');
	loadCss('http://' + server + '/cdn/dojo/agrc/1.0/agrc/themes/standard/map/EmbeddedMap.css');
//	loadCss('../../themes/standard/map/EmbeddedMap.css');
	
	window.djConfig = {
		isDebug: true,
		debugAtAllCosts: true,
		baseUrl: 'http://' + server + '/cdn/dojo/agrc/1.0/',
//		baseUrl: '../../../',
		modulePaths: {
			'agrc': 'agrc'
		},
		afterOnLoad: true,
		addOnLoad: initDojo
	};
	
	// load javascript
	loadJavaScript('http://serverapi.arcgisonline.com/jsapi/arcgis/?v=2.2');
})();
