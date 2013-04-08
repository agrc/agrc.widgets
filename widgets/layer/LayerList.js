/*global dojo, console, agrc, dijit*/
dojo.provide('agrc.widgets.layer.LayerList');

dojo.require('agrc.widgets.layer._LayerList');

dojo.declare('agrc.widgets.layer.LayerList', agrc.widgets.layer._LayerList, {
	// description:
	//		**Summary**:
	//		<p>
	//		**Owner(s)**: Steve Gourley, Scott Davis, Barry Biediger
	//		</p>
	//		<p>
	//		**Test Page**: <a href='/tests/dojo/agrc/1.0/agrc/widgets/tests/' target='_blank'>'agrc.widgets.layer.LayerList.Test</a>
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
	//		<ul><li>LayerList.css</li></ul>
	// example:
	// |	

	constructor: function (args) {
		// summary:
		//		Constructor function for object. 
		// args: Object?
		//		The parameters that you want to pass into the object. Includes: id,
		//		position.
		console.info(this.declaredClass + "::" + arguments.callee.nom);
	},

	_pushVisibleLayerId: function (item) {
		// summary: 
		//      adds the visible layer id to the array of visible layers
		// description:
		//      pushes the visible layer to the array if its parent is visible or if its not a leaf
		// tags:
		//      private
		console.info(this.declaredClass + "::" + arguments.callee.nom);

		// skip group layers - we are only concerned about non-group layers
		// TODO: may not work with a group within a group
		if (item.children[0] !== null) {
			return;
		}

		var parentId = this._store.getValue(item, 'parentLayerId');
		var isParentVisible;

		this._store.fetch({
			query: { id: parentId },
			queryOptions: {
				deep: true
			},
			onItem: dojo.hitch(this, function (parent) {
				isParentVisible = this._store.getValue(parent, 'defaultVisibility');
			})
		});

		if (isParentVisible || parentId === -1) {
			this._visibleLayerIds.push(this._store.getValue(item, 'id'));
		}
	},

	_refreshLayerVisibilty: function () {
		// summary:
		//      shows the visible layers in the map
		// description:
		//      builds the array from the store.fetch and applies it to the map
		// tags:
		//      private
		console.info(this.declaredClass + "::" + arguments.callee.nom);

		this._store.fetch({
			query: { 'defaultVisibility': true },
			onItem: dojo.hitch(this, '_pushVisibleLayerId'),
			onComplete: dojo.hitch(this, '_applyLayerVisibility'),
			queryOptions: {
				deep: true
			}
		});
	},

	_getLayerVisibility: function (item) {
		// summary:
		//      gets the layer visibility
		// description:
		//      this method is basically to show the state of the checkbox. see comments below
		// tags:
		//      private
		// returns:
		//      Boolean
		console.info(this.declaredClass + "::" + arguments.callee.nom);

		var id, parentId, parentVisibile, isVisible;

		id = this._store.getValue(item, 'id');
		parentId = this._store.getValue(item, 'parentLayerId');

		this._store.fetch({
			query: { id: parentId },
			queryOptions: {
				deep: true
			},
			onItem: dojo.hitch(this, function (parent) {
				parentVisibile = this._store.getValue(parent, 'defaultVisibility');
			})
		});

		if (!parentVisibile && parentId > -1) {
			//return default vis of leaf items of a group layer
			dojo.some(this.layer.layerInfos, function (layerInfo) {
				var match = layerInfo.id === id;
				if (match) {
					isVisible = layerInfo.defaultVisibility;
				}

				return match;
			}, this);
		}
		else {
			//return if the id is in the visible layers of the map layer
			return dojo.indexOf(this.layer.visibleLayers, id) > -1 ? true : false;
		}

		return isVisible;
	},

	_applyLayerVisibility: function () {
		// summary:
		//      applies visible layers to map
		// description:
		//      pushes the visible layer id's to the esri layer and refreshes the map
		// tags:
		//      private
		console.info(this.declaredClass + "::" + arguments.callee.nom);

		if (this._visibleLayerIds.length !== 0) {
			this.layer.setVisibleLayers(this._visibleLayerIds);
		} else {
			this.layer.setVisibleLayers([-1]);
		}

		this._visibleLayerIds = [];
	}
});