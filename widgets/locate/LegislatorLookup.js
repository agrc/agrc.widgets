dojo.provide('agrc.widgets.locate.LegislatorLookup');

dojo.require("agrc.widgets.locate.FindAddress");
dojo.require("agrc.widgets.locate._LegislatorMixin");
dojo.require("agrc.widgets.locate.LegislatorDetails");

dojo.declare('agrc.widgets.locate.LegislatorLookup', [agrc.widgets.locate._LegislatorMixin], {
	// description:
	//		**Summary**: A politicion location orchestrating widget that handles the querying and
	//      result event publishing to be used in conjunction with agrc.widgets.locate.LegislatorDetails
	//		Extends agrc.widgets.locate._LegislatorMixin
	//		<p>
	//		**Owner(s)**: Steve Gourley
	//		</p>
	//		<p>
	//		**Test Page**: <a href='/tests/dojo/agrc/1.0/agrc/widgets/tests/LegislatorLookupTest.htm' target='_blank'>agrc.widgets.locate.LegislatorLookupTest.Test</a>
	//		</p>
	//		<p>
	//		**Description**:
	//		This widget handles the location finding of the user, the querying, and publishing of the results to the legislator details widgets.
	//		</p>
	//		<p>
	//		**Published Channels/Events**:
	//		</p>
	//		<ul><li>agrc.widgets.locate.LegislatorLookup.OnFindRepresentative[legLookupArgs]</li>
	//			<li>agrc.widgets.locate.LegislatorLookup.OnFindHouse[legLookupArgs]</li>
	//			<li>agrc.widgets.locate.LegislatorLookup.OnFindSenator[legLookupArgs]</li>
	//			<li>agrc.widgets.locate.LegislatorLookup.OnError[err]</li>
	//		</ul>
	//		<p>
	//			**Exceptions**:
	//		</p>
	//		<ul><li>None</li></ul>
	//		<p>
	//		**Required Files**:
	//		</p>
	//		<ul><li>None</li></ul>
	// example:
	// |	var legLookupArgs = { 
	// |		type: Number, //agrc.widgets.locate._LegislatorMixin.officialType
	// |		districtNumber: String,
	// |		name: String,
	// |		email: string,
	// |		partyAbbreviation: String,
	// |		href: String,
	// |		src: String
	// |	}
	// example:
	// |	var legisLookup = new agrc.widgets.locate.LegislatorLookup({ displayDefault: true }, 'htmlPlacementNode');
	// example:
	// |	var legisDetails = new agrc.widgets.locate.LegislatorDetails({ listenFor: "OnFindHouse" }, "htmlPlacementNode");
	// |	var legisLookup = new agrc.widgets.locate.LegislatorLookup({ displayDefault: false }, 'htmlPlacementNode');

	//must be true if you have dijits in your template string
	widgetsInTemplate: true,

	//location of widget template
	templateString: dojo.cache("agrc.widgets.locate.templates", "LegislatorLookupTemplate.htm"),

	//locator widget node
	//geocoderWidget: dojoAttachPoint,

	// _queryArgs [private] 
	//		index of the specific field in the return array
	_queryArgs: {
		officialsLookup: {
			layer: "SGID93.POLITICAL.OfficialsLookup",
			returnAttrs: "USHOUSE,US_Name,US_Party,US_Web,US_Photo,SENDIST,SEN_Name,SEN_Email,SEN_Party,SEN_Web,SEN_Photo,REPDIST,REP_Name,REP_Email,REP_Party,REP_Web,REP_Photo"            //there's some length issue figure out whassu
		}
	},

	// displayDefault: Boolean
	//      Places results in divs.  Used if not placing results in user placed LegislatorDetail widgets.
	//      Default placement will occur if true.
	displayDefault: true,

	// _queryResultIndexLookup: [private] Object
	//      A lookup object for matching the returnAttrs to the values.
	_queryResultIndexLookup: {
		USHOUSE: 0,
		US_Name: 1,
		US_Party: 2,
		US_Web: 3,
		US_Photo: 4,
		SENDIST: 5,
		SEN_Name: 6,
		SEN_Email: 7,
		SEN_Party: 8,
		SEN_Web: 9,
		SEN_Photo: 10,
		REPDIST: 11,
		REP_Name: 12,
		REP_Email: 13,
		REP_Party: 14,
		REP_Web: 15,
		REP_Photo: 16
	},

	//repContainerNode: dojoAttachPoint
	//senContainerNode: dojoAttachPoint
	//houseContainerNode: dojoAttachPoint

	constructor: function (args) {
		// summary: 
		//		Constructor function for object
		// args: Object?
		//		The parameters that you want to pass into the object. Includes: listenFor and displayDefault
		console.log(this.declaredClass + "::" + arguments.callee.nom);
	},

	postCreate: function () {
		// summary:
		//      Setup subscription to geolocator widget to handle find adress results.
		console.log(this.declaredClass + "::" + arguments.callee.nom);
		this.inherited(arguments);

		this.subscribe("agrc.widgets.locate.FindAddress.OnFind", "getLegislatureForXY");
	},

	getLegislatureForXY: function (geocodeResult) {
		// summary:
		//      Performs the webservice call to get the legislator details for a given UTM x y.
		// description:
		//      Override this method if you would like to call a different web service or set up a different display handler.
		// geocodeResult: Object
		//      The standard response from the agrc.widgets.locate.FindAddress widget
		// tags:
		//      private

		console.log(this.declaredClass + "::" + arguments.callee.nom);

		var legislatorDeferred = dojo.io.script.get({
			url: "//mapserv.utah.gov/WSUT/GetFeatureAttributes.svc/legislatorLookup/layer(" + this._queryArgs.officialsLookup.layer + ")returnAttributes(" + this._queryArgs.officialsLookup.returnAttrs + ")utmX(" + geocodeResult.UTM_X + ")utmY(" + geocodeResult.UTM_Y + ")?dojo",
			callbackParamName: "callback",
			handleAs: "json"
		});

		legislatorDeferred.addCallbacks(dojo.hitch(this, "setDataForDisplay"), "errorHandler");
	},

	setDataForDisplay: function (results) {
		// summary: 
		//      Formatts the response into Property Bags and publishes on named channels or creates a default Detail widget if displayDefault is true.
		// description:
		//      publishes results on named channels agrc.widgets.locate.LegislatorLookup. OnFindRepresentative, OnFindSenator, and OnFindHouse
		// tags:
		//      public
		// results: Object
		//      The response from the webservice GetFeatureAttributes request.

		console.log(this.declaredClass + "::" + arguments.callee.nom);

		var repWidgetArgs = {
			type: this.officialType.representative,
			districtNumber: results.items[this._queryResultIndexLookup.REPDIST].Value,
			name: results.items[this._queryResultIndexLookup.REP_Name].Value,
			email: results.items[this._queryResultIndexLookup.REP_Email].Value,
			partyAbbreviation: results.items[this._queryResultIndexLookup.REP_Party].Value,
			href: results.items[this._queryResultIndexLookup.REP_Web].Value,
			src: results.items[this._queryResultIndexLookup.REP_Photo].Value
		};

		dojo.publish("agrc.widgets.locate.LegislatorLookup.OnFindRepresentative", [repWidgetArgs]);

		if (this.displayDefault) {
			new agrc.widgets.locate.LegislatorDetails(repWidgetArgs, this.repContainerNode).startup();
		}

		var senWidgetArgs = {
			type: this.officialType.senator,
			districtNumber: results.items[this._queryResultIndexLookup.SENDIST].Value,
			name: results.items[this._queryResultIndexLookup.SEN_Name].Value,
			email: results.items[this._queryResultIndexLookup.SEN_Email].Value,
			partyAbbreviation: results.items[this._queryResultIndexLookup.SEN_Party].Value,
			href: results.items[this._queryResultIndexLookup.SEN_Web].Value,
			src: results.items[this._queryResultIndexLookup.SEN_Photo].Value
		};

		dojo.publish("agrc.widgets.locate.LegislatorLookup.OnFindSenator", [senWidgetArgs]);

		if (this.displayDefault) {
			new agrc.widgets.locate.LegislatorDetails(senWidgetArgs, this.senContainerNode).startup();
		}

		var houseWidgetArgs = {
			type: this.officialType.house,
			districtNumber: results.items[this._queryResultIndexLookup.USHOUSE].Value,
			name: results.items[this._queryResultIndexLookup.US_Name].Value,
			email: null, //form on their website might be a url in our data in the future?
			partyAbbreviation: results.items[this._queryResultIndexLookup.US_Party].Value,
			href: results.items[this._queryResultIndexLookup.US_Web].Value,
			src: results.items[this._queryResultIndexLookup.US_Photo].Value
		};
		dojo.publish("agrc.widgets.locate.LegislatorLookup.OnFindHouse", [houseWidgetArgs]);

		if (this.displayDefault) {
			new agrc.widgets.locate.LegislatorDetails(houseWidgetArgs, this.houseContainerNode);
		}
	},

	errorHandler: function (err) {
		// summary: 
		//      handles errors
		// description:
		//      currently just logs the error but should probably publish on a common agrc named channel
		// tags:
		//      public     
		// err: Object
		//		The error returned from the web service calls to get legislator information
		console.log(this.declaredClass + "::" + arguments.callee.nom);

		dojo.publish("agrc.widgets.locate.LegislatorLookup.OnError", [err]);
	}
});