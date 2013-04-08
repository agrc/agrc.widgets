/*global dojo, console, agrc, dijit*/
dojo.provide('agrc.widgets.layer.CheckBoxTree');

dojo.require('dijit.Tree');

dojo.declare('agrc.widgets.layer.CheckBoxTree', [dijit.Tree], {
	// description:
	//		**Summary**:
	//		<p>
	//		**Owner(s)**: Steve Gourley
	//		</p>
	//		<p>
	//		**Description**:
	//		A class that inherits from dijit.Tree to overwrite the node creation method so we can create checkboxes. Mixin is too late in the process and misses the first level of nodes. look at dijit.Tree for documentation.
	//		</p>
	//		<p>
	//		**Published Channels/Events**:
	//		</p>
	//		<ul><li>Same as dijit.Tree</li></ul>
	//		<p>
	//			**Exceptions**:
	//		</p>
	//		<ul><li>dijit.Tree</li></ul>
	//		<p>
	//		**Required Files**:
	//		</p>
	//		<ul><li>dijit.Tree</li></ul>
	// example:
	// |	
	
	// mapServiceVisible: Boolean
	//		Used to populate the root node with the correct value when created
	mapServiceVisible: null,

	_createTreeNode: function (args) {
		// summary: 
		//      create checkbox node
		// description:
		//      overrides the dijit.Tree method and creates an agrx checkbox tree node
		// tags:
		//      private
		// returns: 
		//      agrc.widgets.map._CheckBoxTreeNode

		console.info(this.declaredClass + "::" + arguments.callee.nom);

		args._store = this.model.store;
		args._treeId = this.id;
		args._mapServiceVisible = this.mapServiceVisible;

		return new agrc.widgets.layer._CheckBoxTreeNode(args);
	}
});