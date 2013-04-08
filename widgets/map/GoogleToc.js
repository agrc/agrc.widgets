dojo.provide("agrc.widgets.map.GoogleToc");
dojo.require("agrc.widgets.map._Toc");

dojo.declare("agrc.widgets.map.GoogleToc", agrc.widgets.map._Toc, {
    // description:
    //      **Summary**: A table of contents widget for ArcGIS Server map services for use with the ArcGIS Server Link for Google Maps Javascript API V3
    //      <p>
    //      **Owner(s)**: Barry Biediger, Steve Gourley
    //      </p>
    //      <p>
    //      **Test Page**: <a href='/tests/dojo/agrc/1.0/agrc/widgets/tests/GoogleTocTest.html'>agrc.widgets.map.GoogleTocTest.Test</a>
    //      </p>
    //      <p>
    //      **Description**: 
    //      Creates a Table of contents tree that duplicates the table of contents in the mxd.  A checkbox is provided for each layer and group layer
    //      that is used to turn on and off each layer separately or all sub layers inside a group layer.
    //      </p>
    //		**Published Topics**: (See the [Dojo Topic System](http://dojotoolkit.org/reference-guide/quickstart/topics.html))
    //		<ul>
    //			<li>none</li>
    //		</ul>
    //      example: 
    // |		var toc = new agrc.widgets.map.GoogleToc({  mapServiceLayer: dynamap }, dojo.byId("toc"));
    postMixInProperties: function () {

        var mapServiceUrl = this.mapServiceLayer.mapService_.url;

        //check to see if the web service is on the same server as the map service
        //This errors out if they are both on mapserv since the mapserv services can't resolve "mapserv.utah.gov"
        var populateTocServer = mapServiceUrl.substring(7, mapServiceUrl.indexOf("/", 7));
        var mapServiceServer = this._populateTocServiceUrl.substring(7, this._populateTocServiceUrl.indexOf("/", 7));

        if (populateTocServer === mapServiceServer) {
            mapServiceUrl = mapServiceUrl.replace(mapServiceServer, "localhost");
        }

        this._mapServiceTocUrl = this._populateTocServiceUrl + mapServiceUrl + "?f=pjson";
        console.log("/?");
        console.log(this._mapServiceTocUrl);
        console.log("/?");
        this._getStore();
    },

    _setvisibilities: function (layersVisibilityArray) {
        //console.log(layersVisibilityArray);
        var service = this.mapServiceLayer.getMapService();
        for (var i = 0, count = layersVisibilityArray.length; i < count; i++) {
            if (service.layers[layersVisibilityArray[i].id[0]] != undefined) {
                service.layers[layersVisibilityArray[i].id[0]].visible = layersVisibilityArray[i].visible;
            }
        }
        this.mapServiceLayer.refresh();
    }
});