dojo.provide("agrc.widgets.map.Toc");
dojo.require("agrc.widgets.map._Toc");

dojo.declare("agrc.widgets.map.Toc", agrc.widgets.map._Toc, {
    // description:
    //      **Summary**: A table of contents widget for ArcGIS Server map services (javascript API)
    //      <p>
    //      **Owner(s)**: Barry Biediger, Steve Gourley
    //      </p>
    //      <p>
    //      **Test Page**: <a href='/tests/dojo/agrc/1.0/agrc/widgets/tests/TOCTest.html' target='_blank'>agrc.widgets.map.TOCTest.Test</a>
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
    // example:
    // |	var = new agrc.widgets.map.Toc({ mapServiceLayer: dynamicLayer }, dojo.byId("Toc-div"));
    //

    postMixInProperties: function () {

        var mapServiceUrl = this.mapServiceLayer.url;

        //check to see if the web service is on the same server as the map service
        //This errors out if they are both on mapserv since the mapserv services can't resolve "mapserv.utah.gov"
        var mapServiceServer  = mapServiceUrl.substring(7, mapServiceUrl.indexOf("/", 7));
        var populateTocServer = this._populateTocServiceUrl.substring(7, this._populateTocServiceUrl.indexOf("/", 7));

        if (populateTocServer === mapServiceServer) {
            mapServiceUrl = mapServiceUrl.replace(mapServiceServer, "localhost");
        }

        this._mapServiceTocUrl = this._populateTocServiceUrl + mapServiceUrl + "?f=pjson";
        this._getStore();
    },

    _mapServiceTocUrl: "",

    _setvisibilities: function (layersVisibilityArray) {
        visible = [];
        for (var i = 0, il = layersVisibilityArray.length; i < il; i++) {
            if (layersVisibilityArray[i].visible === true && layersVisibilityArray[i].parent === false) {
                visible.push(layersVisibilityArray[i].id[0]);
            }
        }
        this.mapServiceLayer.setVisibleLayers(visible);
    }
});