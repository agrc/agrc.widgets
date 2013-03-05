/*global dojo, console, agrc, dijit*/
dojo.provide('agrc.widgets.layer._LayerList');

dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dojo.data.ItemFileWriteStore');
dojo.require('dijit.tree.ForestStoreModel');

dojo.require('agrc.widgets.layer.CheckBoxTree');
dojo.require('agrc.widgets.layer._CheckBoxTreeNode');

dojo.declare('agrc.widgets.layer._LayerList', [dijit._Widget, dijit._Templated], {
	// description:
	//		**Summary**:
	//		<p>
	//		**Owner(s)**: Steve Gourley, Scott Davis, Barry Biediger
	//		</p>
	//		<p>
	//		**Test Page**: <a href='/tests/dojo/agrc/1.0/agrc/widgets/tests/_LayerListTests.html' target='_blank'>agrc.widgets.layer._LayerList.Test</a>
	//		</p>
	//		<p>
	//		**Description**:
	//		
	//		</p>
	//		<p>
	//		**Published Channels/Events**:
	//		</p>
	//		<ul><li>None</li></ul>
	//		<p>
	//			**Exceptions**:
	//		</p>
	//		<ul><li>None</li></ul>
	//		<p>
	//		**Required Files**:
	//		</p>
	//		<ul><li>None</li></ul>
	//		<p>
	//		**TODO**:
	//		<ul><li>Make layers work as an []</li>
	//		<li>Try to refactor out web service call</li>
	//		<li>Create google map wrapper</li></ul>
	//		</p>
	// example:
	// |	

	baseClass: "agrc",

	//must be true if you have dijits in your template string
	widgetsInTemplate: true,

	//location of widget template
	templateString: dojo.cache("agrc.widgets.layer.templates", "_LayerListTemplate.html"),

	// _layerListNode: dojoattachpoint
	//      An attachpoint for the toc node

	// _store: Object
	//      The store that is aiding the layer list
	_store: null,

	// _url: String
	//      the url to the webservice
	_url: null,

	// _visibleLayerIds: []
	//      a temporary place for building the visible layer id's array
	_visibleLayerIds: null,

	// Parameters passed in via the constructor

	// layer: esri.Layer || gmaps.ags.MapOverlay
	//      The layer to build the layer list from
	layer: null,

	// rootName: String
	//		The label of the root node on the tree
	rootName: "Map Service",

	// showRoot: Boolean
	//		If true then the root node of the tree is show and wired to 
	//		toggle the visibility of the map service.
	showRoot: false,

	// excludedLayerNodes: []
	//      A string array of excluded checkbox node names to remove from the LayerList. Make sure to encode \ like \\ etc.
	excludedLayerNodes: null,

	// includedLayerNodes: []
	//      A string array ofcheckbox layer nodes names to include in the LayerList. Make sure to encode \ like \\ etc.
	includedLayerNodes: null,

	constructor: function (args) {
		// summary:
		//		Constructor function for object. 
		// args: Object
		//		The parameters that you want to pass into the object. Includes: layer. Optionally: rootName, showRoot.
		// layer: esri.Layer || gmaps.ags.MapOverlay
		//		The ArcGISDynamicMapServiceLayer to build the layer list from (For GoogleToc this needs to be a Google gmaps.ags.MapOverlay)
		console.info("agrc.widgets.layer._LayerList::" + arguments.callee.nom);

		this._visibleLayerIds = [];
		this.excludedLayerNodes = [];
		this.includedLayerNodes = [];
	},

	postCreate: function () {
		// summary:
		//		Sets up the widget
		// description:
		//		
		console.info("agrc.widgets.layer._LayerList::" + arguments.callee.nom);

		this.setupSubscriptions();

		this._buildLayerList(this.layer);
		this.inherited(arguments);
	},

	setupSubscriptions: function () {
		// summary:
		//      where all the pub sub goes on
		// description:
		//      by default pub sub the clicking on a checkbox to set visibility or to close map layers
		// tags:
		//      public
		console.info("agrc.widgets.layer._LayerList::" + arguments.callee.nom);

		this.subscribe("agrc.widgets.layer._CheckBoxTreeNode" + this.id + "_tree" + ".Changed",
			dojo.hitch(this, '_refreshLayerVisibilty'));

		this.subscribe("agrc.widgets.layer._CheckBoxTreeNode" + this.id + "_tree" + ".RootChanged",
			dojo.hitch(this, "toggleMapServiceLayerVisibility"));
	},

	_buildLayerList: function (layer) {
		// summary:
		//      formats the layer infos into store format
		// tags:
		//      private
		console.info("agrc.widgets.layer._LayerList::" + arguments.callee.nom);

		var data = {
			identifier: "id",
			label: "name",
			items: []
		};

		dojo.forEach(layer.layerInfos, function (info) {
			var showNode = false;
			if (dojo.indexOf(this.excludedLayerNodes, info.name) === -1) {
				showNode = true;
			}

			if (this.includedLayerNodes.length > 0) {
				showNode = dojo.indexOf(this.includedLayerNodes, info.name) > -1 ? true : false;
			}

			if (showNode) {
				var visible = dojo.indexOf(layer.visibleLayers, info.id) > -1;

				var item = {
					name: info.name,
					id: info.id,
					children: null,
					defaultVisibility: info.defaultVisibility,
					visible: visible,
					parentLayerId: info.parentLayerId
				};

				if (item.parentLayerId === -1) {
					data.items.push(item);
				}
				else {
					dojo.some(data.items, function (matchItem) {
						if (matchItem.id === item.parentLayerId) {
							if (matchItem.children === null) {
								matchItem.children = [];
							}

							matchItem.children.push(item);

							return true;
						}
						else {
							return false;
						}
					}, this);
				}
			}
		}, this);

		this._store = new dojo.data.ItemFileWriteStore({
			data: data
		});

		this._store.fetch({
			onItem: dojo.hitch(this, '_updateStoreWithActualValues'),
			onComplete: dojo.hitch(this._store, 'save'),
			queryOptions: {
				deep: true
			}
		});

		var model = new dijit.tree.ForestStoreModel({
			store: this._store,
			labelAttr: "name",
			childrenAttr: "children",
			layoutAllign: "right",
			deferItemLoadingUntilExpand: false,
			rootLabel: this.rootName
		});

		dojo.mixin(model, {
			mayHaveChildren: function (item) {
				return !!(dojo.isArray(item.children) && !!item.children[0]) ? true : false;
			}
		});

		var tree = new agrc.widgets.layer.CheckBoxTree({
			model: model,
			persist: false,
			showRoot: this.showRoot,
			openOnClick: true,
			id: this.id + "_tree",
			mapServiceVisible: layer.visible
		}, this._layerListNode);

		tree.startup();


		dojo.publish("agrc.widgets.layer._CheckBoxTreeNode" + this.id + "_tree" + ".Changed");
	},

	errorFunc: function (e) {
		// summary:
		//      error handler
		// description:
		//      error publisher
		// tags:
		//      public
		console.info("agrc.widgets.layer._LayerList::" + arguments.callee.nom);

		dojo.publish('agrc.widgets.layer._LayerList' + this.id + '.Error', [e]);
	},

	_updateStoreWithActualValues: function (item) {
		// summary:
		//      adds the layer vis from the layer itself not the mxd
		// description:
		//      update visibility param from the layer passed in not the default value
		// tags:
		//      private
		// returns:
		//      Object
		console.info("agrc.widgets.layer._LayerList::" + arguments.callee.nom);

		this._store.setValue(item, "defaultVisibility", this._getLayerVisibility(item));
	},

	toggleMapServiceLayerVisibility: function (visible) {
		// summary:
		//		Turns on or off the map service visibility
		// visible: Boolean
		console.info("agrc.widgets.layer._LayerList::" + arguments.callee.nom);

		this.layer.setVisibility(visible);
	}
});