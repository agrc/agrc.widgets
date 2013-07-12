# AGRC Dojo Widgets
### Using Our Widgets
You can use our widgets just like any other [Dojo widget](http://dojotoolkit.org/reference-guide/dijit/info.html#dijit-info). Just be sure to set your [packages loader config](http://dojotoolkit.org/documentation/tutorials/1.9/cdn/) property so that Dojo knows where to look. Since most of our widgets are built on [ESRI's ArcGIS API for JavaScript](https://developers.arcgis.com/en/javascript/index.html), you'll have to load their API as well. See below for an example:

```javascript
require({
  packages: [{
    name: 'agrc',
    location: 'http://mapserv.utah.gov/cdn/dojo/agrc/2.0/'
  }]
}, [
  'esri/map',
  'esri/layers/ArcGISTiledMapServiceLayer',
  'agrc/widgets/locate/FindAddress'

],
        
function (Map, Tiled, FindAddress) {
  var serviceUrl = 'http://mapserv.utah.gov/arcgis/rest/services/BaseMaps/Terrain/MapServer';
  var map = new Map('map-div');
  
  var tiledService = new Tiled(serviceUrl);
  
  map.addLayer(tiledService);
  
  var findAddress = new FindAddress({
    map: map,
    apiKey: 'AGRC-BF574B94717020'
  }, 'find-address');
});
```

### Browser Compatibility
We support [the same browsers](https://developers.arcgis.com/en/javascript/jshelp/supported_browsers.html) that ESRI's API does.