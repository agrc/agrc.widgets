dojo.provide("agrc.widgets.map._TocTree");
dojo.require("dijit.Tree");


dojo.declare("agrc.widgets.map.


_CheckBoxTreeNode
", dijit._TreeNode, {


    _checkbox: null,

    _layersVisibilityArray: new Array(),

    _onClick: function (evt) {
        if (evt.target.nodeName == 'INPUT') {

            //create an array to hold the visibilities of all layers affected by this click
            var childrenArray = this.item.children;
            this.item.defaultVisibility[0] = evt.target.checked;
            this._setVisibilities(this.item._S._arrayOfTopLevelItems, null); //parentVisibility null on first time through
            dojo.publish("set_layer_visibilities", [this._layersVisibilityArray]);
            this._layersVisibilityArray.length = 0;
        }
        else {

            return this.inherited(arguments);
        }
    },

    _setVisibilities: function (items, parentVisibility) {//visibility depends on the parent's visibility
        var layerVisibility;
        var currentNode;
        for (var i = 0, cnt = items.length; i < cnt; i++) {
            currentNode = this.tree.getNodesByItem(items[i]);
            switch (parentVisibility) {
                case null:
                    layerVisibility = items[i].defaultVisibility[0];
                    break; //null is only for top level
                case true:
                    layerVisibility = items[i].defaultVisibility[0];
                    if (currentNode[0] != undefined) {
                        currentNode[0]._checkbox.disabled = false;
                    }
                    break; //visible is true when checked
                case false:
                    layerVisibility = false;
                    if (currentNode[0] != undefined) {
                        currentNode[0]._checkbox.disabled = true;
                    }
                    //this._checkbox.disabled = true;
                    break;
                default:
                    layerVisibility = true;
            }
            items[i].visible[0] = layerVisibility;

            this._layersVisibilityArray.push({
                id: items[i].id,
                visible: layerVisibility,
                name: items[i].name,
                parent: items[i].children[0] === null ? false : true
            });

            if (items[i].children[0] != null) {
                this._setVisibilities(items[i].children, items[i].visible[0]);
            }
        }
    },

    _createCheckbox: function () {
        var parentVis = true;
        var parentID;
        if (this.item._S && this.item.parentLayerId[0] > -1) {
            if (this.item.parentLayerId) {
                parentID = this.item.parentLayerId;
            }
            parentVis = this.item._S._arrayOfAllItems[parentID].visible;
        }

        //v v added 3_15_11 to turn off top level expandos when top level nodes have no children - BB v v
        else if (this.item.parentLayerId && !this.item.children[0]) {
            this.isExpanded = true;
            this.isExpandable = false;
            dojo.style(this.expandoNode, "visibility", "hidden");
            dojo.removeClass(this.iconNode, "dijitFolderClosed");
            dojo.addClass(this.iconNode, "dijitLeaf");
        }
        //^ ^ added 3_15_11 to turn off top level expandos when top level nodes have no children - BB ^ ^

        this._checkbox = dojo.doc.createElement('input');
        this._checkbox.type = 'checkbox';

        dojo.place(this._checkbox, this.expandoNode, 'after');

        //set checked based on defaultVisiblity of map service layer
        if (this.item.defaultVisibility) {
            this._checkbox.checked = this.item.defaultVisibility[0];
            //if its not a root element, disable if def vis off
            if (this.item._RI != true) {
                this._checkbox.disabled = parentVis[0] ? false : true;
            }
        }

    },

    postCreate: function () {
        this.inherited(arguments);
        this._createCheckbox();
    }

});

dojo.declare("agrc.widgets.map._TocTree", dijit.Tree, {
    _createTreeNode: function (args) {
        return new agrc.widgets.map.


_CheckBoxTreeNode
(args);
    }

});
