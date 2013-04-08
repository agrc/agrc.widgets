dojo.provide("agrc.widgets.locate._LegislatorMixin");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");

dojo.declare('agrc.widgets.locate._LegislatorMixin', [dijit._Widget, dijit._Templated], {
	// description:
	//		**Summary**: A base class to share the type enum across all the widgets
	//		<p>
	//		**Owner(s)**: Steve Gourley
	//		</p>
	//		<p>
	//		**Description**:
	//		use as a mixin
	//		</p>
	//		<p>
	//		**Published Channels/Events**:
	//		</p>
	//		<ul><li>None</li>
	//		</ul>
	//		<p>
	//			**Exceptions**:
	//		</p>
	//		<ul><li>None</li></ul>
	//		<p>
	//		**Required Files**:
	//		</p>
	//		<ul><li>None</li></ul>

	constructor: function () {
		// summary:
		//		Constructor function for object.
	},

	// officialType: Object
	//		mimix an enum
	officialType: {
		senator: 1,
		representative: 2,
		house: 3
	}
});