dojo.provide('agrc.widgets.locate.LegislatorDetails');

dojo.require("dijit.layout.BorderContainer");
dojo.require("agrc.widgets.locate._LegislatorMixin");
dojo.require("dijit.layout.ContentPane");

dojo.declare('agrc.widgets.locate.LegislatorDetails', [agrc.widgets.locate._LegislatorMixin], {
	// description:
	//		**Summary**: A widget to display the results from agrc.widgets.locate.LegislatorLookup
	//		<p>
	//		**Owner(s)**: Steve Gourley
	//		</p>
	//		<p>
	//		**Test Page**: <a href='/tests/dojo/agrc/1.0/agrc/widgets/tests/LegislatorLookupTest.htm' target='_blank'>agrc.widgets.locate.LegislatorLookupTest.Test</a>
	//		</p>
	//		<p>
	//		**Description**:
	//		The view for LegislatorLookup.  Allows the end user to place the result from the query where ever they choose on their website
	//		</p>
	//		<p>
	//		**Published Topics**:
	//		</p>
	//		<ul><li>None</li>
	//		</ul>
	//		<p>
	//		**Exceptions**:
	//		</p>
	//		<ul><li>None</li></ul>
	//		<p>
	//		**Required Files**:
	//		</p>
	//		<ul><li>None</li></ul>
	// example:
	// |	var legisDetails = new agrc.widgets.locate.LegislatorDetails({ listenFor: "OnFindHouse" }, "htmlPlacementNode");

    //must be true if you have dijits in your template string
    widgetsInTemplate: true,

    //location of widget template
    templateString: dojo.cache("agrc.widgets.locate.templates", "LegislatorDetailsTemplate.htm"),

    // type: Number    
    //		A lookup to tell the widget if the results are a senator,rep,or us rep
    type: 0,

    // districtNumber: Number
    //		The district number the legistlator is responsible for
    districtNumber: "",

    // name: String
    //		The politicians name
    name: "",

    // email: String
    //		The politicians email   
    email: "",

    // partyAbbreviation: String
    //		R or D depending on party
    partyAbbreviation: "",

    // party: String
    //		The full spelling of Democrat etc
    party: "",

    // href: String
    //		An attribute mapped field for linking to the politicians website
    href: "",

    // src: String
    //		An attribute mapped field for the src for the politicians photo
    src: "",

    // listenFor: String
    //		A magic string for which named channel publish to listen for.  Matches with 
    //      LegislatorLookup named publish channels: OnFindRepresentative, OnFindSenator, or OnFindHouse
    listenFor: "",

    //districtNode: dojoAttachPoint
    //nameNode: dojoAttachPoint
    //emailNode: dojoAttachPoint
    //partyNode: dojoAttachPoint
    //websiteUrlNode: dojoAttachPoint
    //photoUrlNode: dojoattachpoint

    // attributeMap: AttributeMap
    //		attribute map for displaying politician information
    attributeMap:
        dojo.delegate(dijit._Widget.prototype.attributeMap, {
            districtNumber: {
                node: "districtNode",
                type: "innerHTML"
            },
            name: {
                node: "nameNode",
                type: "innerHTML"
            },
            email: {
                node: "emailNode",
                type: "innerHTML"
            },
            party: {
                node: "partyNode",
                type: "innerHTML"
            },
            href: {
                node: "websiteUrlNode",
                type: "attribute"
            },
            src: {
                node: "photoUrlNode",
                type: "attribute"
            },
            type: {
                node: "policicalTitleNode",
                type: "innerHTML"
            }
        }),

    postMixInProperties: function () {
        // summary: 
        //		changes some of the mixed in properties and styles the widget
        // description:
        //		if R adds Republication to title sets colors based on party

        console.log(this.declaredClass + "::" + arguments.callee.nom);
        this.inherited(arguments);

        if (this.partyAbbreviation && this.partyAbbreviation === "R") {
            this.party = "Republican";
        }
        else if (this.partyAbbreviation && this.partyAbbreviation === "D") {
            this.party = "Democrat";
        }

        if (this.type) {
            switch (this.type) {
                case 1:
                    this.type = "State Senator";
                    break;
                case 2:
                    this.type = "State Representative";
                    break;
                case 3:
                    this.type = "US Represenative";
                    break;
                default: break;
            }
        }
    },

    postCreate: function () {
        // summary: 
        //      sets up the widget subscriptions and display settings
        // description:
        //      hides the widget for nice fade in effect and sets up subscriptions if listenFor has a value
        //      otherwise calles this.displayPolitician 

        console.log(this.declaredClass + "::" + arguments.callee.nom);
        this.inherited(arguments);
        dojo.style(this.domNode, "opacity", 0);

        this._switchLookupValues();

        if (this.listenFor) {
            this.subscribe('agrc.widgets.locate.FindAddress.OnFindStart', function () {
                dojo.fadeOut({
                    node: this.domNode,
                    duration: 1000
                }).play();
            });

            this.subscribe("agrc.widgets.locate.LegislatorLookup." + this.listenFor, "displayPolitician");
        }
        else {
            this.displayPolitician();
        }
    },

    _switchLookupValues: function () {
        // summary: 
        //      handles the lookup swapping
        // description:
        //      swaps abbreviation for whole name and sets type
        // tags:
        //     private

        console.log(this.declaredClass + "::" + arguments.callee.nom);

        if (this.partyAbbreviation && this.partyAbbreviation === "R") {
            this.set('party', "Republican");
        }
        else if (this.partyAbbreviation && this.partyAbbreviation === "D") {
            this.set('party', "Democrat");
        }

        if (this.type) {
            switch (this.type) {
                case 1:
                    this.set('type', "State Senator");
                    break;
                case 2:
                    this.set('type', "State Representative");
                    break;
                case 3:
                    this.set('type', "US Represenative");
                    break;
                default: break;
            }
        }
    },

    colorizeBanners: function () {
        // summary: 
        //      Sets the colors on the widget based on political colors
        // description:
        //      Blue for democrats, red for Republicans
        //      TODO:// add other parties
        // tags:
        //      protected
       
        console.log(this.declaredClass + "::" + arguments.callee.nom);

        if (this.party) {
            dojo.style(this.top, "backgroundColor", this.party === "Democrat" ? "blue" : "red");
            dojo.style(this.bottom, "backgroundColor", this.party === "Democrat" ? "blue" : "red");
        }
    },

    displayPolitician: function (args) {
        // summary: 
        //      Displays the widget with a nice fade in and all values populated
        // tags:
        //      public
        // args: Object    
        //      The results from the web service 
       
        console.log(this.declaredClass + "::" + arguments.callee.nom);

        if (args) {
            //FIXME: mixin doesn't fire the setters/getters?
            //dojo.mixin(this, args);

            this.set("type", args.type);
            this.set("partyAbbreviation", args.partyAbbreviation);
            this.set("districtNumber", args.districtNumber);
            this.set("name", args.name);
            this.set("email", args.email);
            dojo.attr(this.emailNode, "href", "mailto:" + args.email + "?subject=Message Via AGRC Legislator Lookup Service");
            this.set("href", args.href);
            this.set("src", args.src);
            this._switchLookupValues();
        }

        this.colorizeBanners();

        dojo.fadeIn({
            node: this.domNode,
            duration: 5000
        }).play();
    }
});