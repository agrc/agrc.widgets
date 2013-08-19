/*global dojo, console, agrc, dijit*/
dojo.provide('agrc.widgets.layer._CheckBoxTreeNode');

dojo.require('dijit.Tree');
dojo.require('dijit.form.CheckBox');

dojo.declare('agrc.widgets.layer._CheckBoxTreeNode', [dijit._TreeNode], {
	// description:
	//		**Summary**:
	//		<p>
	//		**Owner(s)**: Steve Gourley, Scott Davis, Barry Biediger
	//		</p>
	//		<p>
	//		**Test Page**: <a href='/tests/dojo/agrc/1.0/agrc/widgets/tests/' target='_blank'>'agrc.widgets.layer._CheckBoxTreeNode.Test</a>
	//		</p>
	//		<p>
	//		**Description**:
	//		
	//		</p>
	//		<p>
	//		**Published Channels/Events**:
	//		</p>
	//		<ul><li>agrc.widgets.layer._CheckBoxTreeNode.Changed - fired when checkbox is clicked on</li></ul>
	//		<p>
	//			**Exceptions**:
	//		</p>
	//		<ul><li>None</li></ul>
	//		<p>
	//		**Required Files**:
	//		</p>
	//		<ul><li>None</li></ul>
	// example:
	// |	
	_checkbox: null,

	// _store: dojo.data.ItemFileWriteStore
	//      a reference to the parent store
	_store: null,

	// _treeId: String
	//		The unique (hopefully) id of the tree. Used to provide a unique id for the node.
	_treeId: "",

	// _mapServiceVisible: Boolean
	_mapServiceVisible: null,

	constructor: function (args) {
		// summary:
		//		Constructor function for object. 
		// args: Object?
		//		The parameters that you want to pass into the object. Includes: _store, _treeId, _mapServiceVisible
		console.info("agrc.widgets.layer._CheckBoxTreeNode::" + arguments.callee.nom);
	},

	postCreate: function () {
		// summary: 
		//      creates the checkbox next to the tree label
		// description:
		//      creates the checkbox with its intial checked value based on the item file read store.
		//		the store queried the web service then was updated by the layer since we don't always
		//		want to show the default visibility. This also sets the disabled attribute on the checkbox
		//		if a child of a group layer node is unchecked.
		// tags:
		//      private

		console.info("agrc.widgets.layer._CheckBoxTreeNode::" + arguments.callee.nom);
		this.inherited(arguments);

		this._checkbox = new dijit.form.CheckBox({
			id: !this.item.root ? this._treeId + "agrc.widgets.layer._CheckBoxTreeNode" + "_" + this._store.getValue(this.item, 'id') : null,
			checked: this.item.root ? this._mapServiceVisible : this._store.getValue(this.item, 'defaultVisibility')
		}).placeAt(this.expandoNode, 'after');

		if (!this.item.root) {
			var parentId = this._store.getValue(this.item, 'parentLayerId');

			if (parentId > -1) {
				this._store.fetch({
					query: { id: parentId },
					queryOptions: {
						deep: true
					},
					onItem: dojo.hitch(this, function (parent) {
						var vis = this._store.getValue(parent, 'defaultVisibility');
						this._checkbox.set('disabled', !vis);
					})
				});
			}
		}
	},

	_onClick: function (evt) {
		// summary: 
		//      handling the click event on a tree node
		// description:
		//      check to see if the target of the click was an input, one of our checkboxes for toggling vis,
		//		or the label or something else in the tree
		// tags:
		//      private
		console.info("agrc.widgets.layer._CheckBoxTreeNode::" + arguments.callee.nom);

		if (evt.target.nodeName === 'INPUT') {
			this._onCheckBoxChange(evt.target);
		}
		else {
			return this.inherited(arguments);
		}
	},

	_onCheckBoxChange: function (checkbox) {
		// summary: 
		//      handles when checkbox was clicked
		// description:
		//      changes the value in the store and publishes to update visibilities
		//		adds an id to the node so we can query for it to change the disabled attribute later on
		// tags:
		//      private
		console.info("agrc.widgets.layer._CheckBoxTreeNode::" + arguments.callee.nom);
		
		function toggleChildren(rootNode) {
				var children = rootNode.getChildren();

				if (children) {
					dojo.forEach(children, function (child) {
						child._checkbox.set("disabled", !checkbox.checked);
						toggleChildren(child);
					}, this);
				}
			}
		
		// check to see if this is the root node
		if (this.item.root) {
			dojo.publish("agrc.widgets.layer._CheckBoxTreeNode" + this._treeId + ".RootChanged", [checkbox.checked]);

			toggleChildren(this);
		} else {
			var children = this._store.getValues(this.item, 'children');

			//returns [null] when has no children
			if (children[0]) {
				dojo.forEach(children, function (cb) {
					var node = dijit.byId(this._treeId + "agrc.widgets.layer._CheckBoxTreeNode" + "_" + this._store.getValue(cb, 'id'));
					if (node) {
						node.set('disabled', !checkbox.checked);
					}
				}, this);
			}

			this._store.setValue(this.item, 'defaultVisibility', checkbox.checked);
			this._store.save();

			dojo.publish("agrc.widgets.layer._CheckBoxTreeNode" + this._treeId + ".Changed");
		}
	}
});