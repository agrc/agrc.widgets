[
	{
		name: 'utahdfofuelsites',
		services: [
			{
				url: 'http://mapserv.utah.gov/ArcGIS/rest/services/UtahBasemap-Hybrid/MapServer',
				type: esri.layers.ArcGISTiledMapServiceLayer
			},
			{
				url: 'http://mapserv.utah.gov/ArcGIS/rest/services/UtahDFOFuelSites/MapServer',
				type: esri.layers.ArcGISDynamicMapServiceLayer
			}
		]
	},
	{
		name: 'test',
		services: [
			{
				url: 'http://mapserv.utah.gov/ArcGIS/rest/services/UtahBasemap-Hybrid/MapServer',
				type: esri.layers.ArcGISTiledMapServiceLayer,
				args: {id: 'testLayer'}
			},
			{
				url: 'http://mapserv.utah.gov/ArcGIS/rest/services/UtahDFOFuelSites/MapServer',
				type: esri.layers.ArcGISDynamicMapServiceLayer,
				args: {opacity: 0.5}
			}
		]
	}
]