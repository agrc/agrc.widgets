[
	{
		name: 'utahdfofuelsites',
		services: [
			{
				url: '//mapserv.utah.gov/ArcGIS/rest/services/UtahBasemap-Hybrid/MapServer',
				type: esri.layers.ArcGISTiledMapServiceLayer
			},
			{
				url: '//mapserv.utah.gov/ArcGIS/rest/services/UtahDFOFuelSites/MapServer',
				type: esri.layers.ArcGISDynamicMapServiceLayer
			}
		]
	},
	{
		name: 'test',
		services: [
			{
				url: '//mapserv.utah.gov/ArcGIS/rest/services/UtahBasemap-Hybrid/MapServer',
				type: esri.layers.ArcGISTiledMapServiceLayer,
				args: {id: 'testLayer'}
			},
			{
				url: '//mapserv.utah.gov/ArcGIS/rest/services/UtahDFOFuelSites/MapServer',
				type: esri.layers.ArcGISDynamicMapServiceLayer,
				args: {opacity: 0.5}
			}
		]
	}
]