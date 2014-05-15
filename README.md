# AGRC Dojo Widgets [![Build Status](https://travis-ci.org/agrc/agrc.widgets.svg?branch=master)](https://travis-ci.org/agrc/agrc.widgets)
### Getting Started

1. Clone the repo
2. `npm install && bower install && grunt`

You can use our widgets just like any other [Dojo widget](http://dojotoolkit.org/reference-guide/dijit/info.html#dijit-info). Just be sure to set your [packages loader config](http://dojotoolkit.org/documentation/tutorials/1.9/cdn/) property so that Dojo knows where to look.




### Sample

```javascript
require({
  packages: [{
    name: 'agrc',
    location: '../agrc.widgets'
  }]
}, [
  'esri/map',
  'esri/layers/ArcGISTiledMapServiceLayer',
  
  'agrc/widgets/locate/FindAddress'
], function (
Map, 
Tiled,

FindAddress
) {
  var serviceUrl = 'http://mapserv.utah.gov/arcgis/rest/services/BaseMaps/Terrain/MapServer';
  var map = new Map('map-div');
  
  var tiledService = new Tiled(serviceUrl);
  
  map.addLayer(tiledService);
  
  var findAddress = new FindAddress({
    map: map,
    apiKey: 'get your key at http://developer.mapserv.utah.gov'
  }, 'find-address');
});
```

### Browser Compatibility
We support [the same browsers](https://developers.arcgis.com/en/javascript/jshelp/supported_browsers.html) that ESRI's API does.
