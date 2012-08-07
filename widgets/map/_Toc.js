
dojo.provide("agrc.widgets.map._Toc");
dojo.require("agrc.widgets.map._TocTree");
dojo.require("dojo.parser");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dojo.data.ItemFileWriteStore");
dojo.require("dijit.tree.ForestStoreModel");
dojo.require("dijit.Tree");
dojo.require("dijit.TitlePane");
dojo.require("dijit.Menu");
dojo.require("dijit.MenuItem");
dojo.require("dojo.io.script");


dojo.declare("agrc.widgets.map._Toc", [dijit._Widget, dijit._Templated], {

    widgetsInTemplate: true,
    
    templateString: dojo.cache("agrc.widgets.map", "templates/Toc.html"),
    
    _treeStore: {},
    
    _populateTocServiceUrl: "//mapserv.utah.gov/WSUT/Dojo.svc/PopulateTOC?serviceDefURL=",
    
    _mapServiceTocUrl: "",
    
    // mapServiceLayer: [public]
    //     The ArcGISDynamicMapServiceLayer to tie the TOC to (For GoogleToc this needs to be a Google gmaps.ags.MapOverlay)
    mapServiceLayer: {},
    constructor: function(mapServiceLayer){
        // summary:
        //		Constructor function for object
        // mapServiceLayer: Object
        //		The ArcGISDynamicMapServiceLayer to tie the TOC to (For GoogleToc this needs to be a Google gmaps.ags.MapOverlay)
    },
    postCreate: function(){
        dojo.subscribe("close_map_layers", dojo.hitch(this, function(){
            if (this.pane_map_layers.get("open")) {
                this.pane_map_layers.toggle();
            }
        }));
        
        dojo.subscribe("set_layer_visibilities", dojo.hitch(this, function(layerVisArray){
            // console.log("layerVisArray:::",layerVisArray);
            this._setvisibilities(layerVisArray);
        }));
    },
    
    _getStore: function(){
        var jsonpArgs = {
            url: this._mapServiceTocUrl,
            //url: "http://dagrc.utah.gov/WSUT/Dojo.svc/PopulateTOC?serviceDefURL=http://dagrc.utah.gov/ArcGIS/rest/services/CO2/WESTCARB/MapServer?f=pjson",
            callbackParamName: "callback",
            load: dojo.hitch(this, function(data){
                if (data == null) {
                    console.log("error loading layer list - returned null");
                }
                else {
                    this._treeStore = new dojo.data.ItemFileWriteStore({
                        data: data
                    });
                    this._makeTree();
                }
            }),
            error: function(data){
                console.log("error loading layer list", data);
            }
        }
        dojo.io.script.get(jsonpArgs);
    },
    
    _makeTree: function(){
        var TOCTreeModel = new dijit.tree.ForestStoreModel({
            //deferItemLoadingUntilExpand: true,
            store: this._treeStore,
            labelAttr: "name",
            childrenAttr: "children",
            layoutAllign: "right",
            deferItemLoadingUntilExpand: false,
            rootLabel: "Map Layers"
        });
        
        
        var tocTree = new agrc.widgets.map._TocTree({ //dijit.Tree
            model: TOCTreeModel,
            persist: false,
            showRoot: false,
            openOnClick: true
        }, this._TOC);
        
        dojo.mixin(TOCTreeModel, {
            mayHaveChildren: function(item){
                return item.children[0] == null ? false : true;
            }
        });
        
        tocTree.startup();
    }
});

