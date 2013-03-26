/*global dojo, console, agrc, esri*/
define([
        'dojo/_base/declare',
        'dijit/_WidgetBase',
        'dijit/_TemplatedMixin',
        'dojo/text!agrc/widgets/locate/templates/FindAddress.html',
        'dojo/io/script',
        'dojo/topic',
        'dojo/dom-style',
        'dojo/_base/Color',
        'dojo/when',
        'dojo/_base/lang',
        'dojo/on'
    ],
    function(declare,
        widgetBase,
        templatedMixin,
        template,
        io,
        topic,
        style,
        color,
        when,
        lang,
        on) {
        // description:
        //		**Summary**: A simple form tied to the map allowing a user to quickly zoom to an address.
        //		<p>
        //		**Owner(s)**: Scott Davis, Steve Gourley
        //		</p>
        //		<p>
        //		**Test Page**: <a href='/tests/dojo/agrc/1.0/agrc/widgets/tests/FindAddressTests.html' target='_blank'>
        //			agrc.widgets.map.FindAddress.Tests</a>
        //		</p>
        //		<p>
        //		**Description**:
        //		This widget hits the [agrc geocoding web service](http://gis.utah.gov/web-services/address-geolocator-2).
        //		</p>
        //		<p>
        //		**Published Topics**: (See the [Dojo Topic System](http://dojotoolkit.org/reference-guide/quickstart/topics.html))
        //		</p>
        //		<ul>
        //			<li>agrc.widgets.locate.FindAddress.OnFindStart[none]</li>
        //			<li>agrc.widgets.locate.FindAddress.OnFind[result]</li>
        //			<li>agrc.widgets.locate.FindAddress.OnFindError[err]</li>
        //		</ul>
        //		**Exceptions**:
        //		</p>
        //		<ul><li>agrc.widgets.locate.FindAddress NullReferenceException: map. Pass the map in the constructor.</li></ul>
        //		<p>
        //		**Required Files**:
        //		</p>
        //		<ul><li>agrc/themes/standard/locate/FindAddress.css</li></ul>
        //
        // example:
        // |	new agrc.widgets.locate.FindAddress({map: map}, 'test1');

        return declare('agrc.widgets.locate.FindAddress',
            [widgetBase, templatedMixin], {
                templateString: template,
                baseClass: 'AGRC',
                map: null,
                title: 'Find Street Address',
                symbol: null,
                graphicsLayer: null,
                _graphic: null,
                zoomLevel: 12,
                apiKey: null,

                constructor: function() {
                    // summary:
                    //      first function to fire after page loads
                    console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
                },

                postMixInProperties: function() {
                    // summary:
                    //      postMixin properties like symbol and graphics layer
                    // description:
                    //      decide whether to use default graphics layer and symbol
                    // tags:
                    //      public
                    console.info(this.declaredClass + "::" + arguments.callee.nom);

                    // default to use the map's graphics layer if none was passed in
                    if (!this.graphicsLayer && !!this.map) {
                        this.connect(this.map, 'onLoad', function() {
                            this.graphicsLayer = this.map.graphics;
                        });
                    }

                    // create symbol if none was provided in options
                    if (!this.symbol && !!this.map) {
                        this.symbol = new esri.symbol.SimpleMarkerSymbol();
                        this.symbol.setStyle(esri.symbol.SimpleMarkerSymbol.STYLE_DIAMOND);
                        this.symbol.setColor(new color([255, 0, 0, 0.5]));
                    }
                },

                postCreate: function() {
                    this.form_geocode.onsubmit = function(e) {
//                        e.preventDefault();
                        return false;
                    };

                    on(this.btn_geocode, 'click', lang.hitch(this, 'geocodeAddress'));
                },

                geocodeAddress: function() {
                    // summary:
                    //		Geocodes the address if the text boxes validate.
                    console.info(this.declaredClass + '::' + arguments.callee.nom);

                    if (this._validate()) {
                        topic.publish('agrc.widgets.locate.FindAddress.OnFindStart');

                        this._geocoding();

                        if (this.map && this._graphic) {
                            this.graphicsLayer.remove(this._graphic);
                        }

                        var address = "326 east south temple";
                        var zone = '84111';

                        when(this._invokeWebService({ street: address, zone: zone }),
                            lang.hitch(this, '_onFind'), lang.hitch(this, '_onError'));
                    } else {
                        this._done();
                    }

                    return false;
                },

                _invokeWebService: function(geocode) {
                    // summary:
                    //      calls the web service
                    // description:
                    //      sends the request to the wsut webservice
                    // tags:
                    //      private
                    // returns:
                    //     Deferred 
                    console.info(this.declaredClass + "::" + arguments.callee.nom);

                    var params = {
                        callbackParamName: "callback",
                        url: "http://api.mapserv.utah.gov/api/v1/Geocode/{geocode.street}/{geocode.zone}?apiKey={apiKey}",
                        handleAs: "json",
                        preventCache: true
                    };

                    params.url = lang.replace(params.url,
                        {
                            geocode: geocode,
                            apiKey: this.apiKey
                        });

                    console.log(params);

                    return io.get(params);
                },

                _validate: function() {
                    // summary:
                    //      validates the widget
                    // description:
                    //      makes sure the street and zone have valid data
                    // tags:
                    //      private
                    // returns:
                    //      bool
                    console.info(this.declaredClass + "::" + arguments.callee.nom);

                    var ok = true;

                    // hide error message
                    style.set(this.errorMsg, 'display', 'none');

                    // check for valid address and zone
                    if (!this._isValid(this.txt_address)) {
                        this.txt_address._message = '';
                        this.txt_address.displayMessage('Please enter an address.');

                        ok = false;
                    }

                    if (!this._isValid(this.txt_zone)) {
                        this.txt_zone.displayMessage('Please enter a zip or city.');

                        ok = false;
                    }

                    return ok;
                },

                _isValid: function(txt) {
                    return true;
                },

                _geocoding: function() {

                },

                _done: function() {

                },

                _onFind: function(result) {
                    // summary:
                    //      handles a successful geocode
                    // description:
                    //      zooms the map if there is one. publishes the result
                    // tags:
                    //      private
                    console.info(this.declaredClass + "::" + arguments.callee.nom);

                    this.onFind(result);

                    if (this.map) {
                        var point = new esri.geometry.Point(result.UTM_X, result.UTM_Y, this.map.spatialReference);

                        if (this.map.getLevel() > -1) {
                            this.map.centerAndZoom(point, this.zoomLevel);
                        } else {
                            this.map.centerAndZoom(point, esri.geometry.getScale(this.map.extent, this.map.width, this.map.spatialReference.wkid) / this.zoomLevel);
                        }

                        this._graphic = new esri.Graphic(point, this.symbol, result);
                        this.graphicsLayer.add(this._graphic);
                    }

                    this.done();

                    topic.publish("agrc.widgets.locate.FindAddress.OnFind", [result]);
                },

                _onError: function(err) {
                    // summary:
                    //      handles script io geocoding error
                    // description:
                    //      publishes error
                    // tags:
                    //      private
                    // returns:
                    //       
                    console.info(this.declaredClass + "::" + arguments.callee.nom);

                    style.set(this.errorMsg, 'display', 'inline');

                    // re-enable find button
                    this._done();

                    topic.publish('agrc.widgets.locate.FindAddress.OnFindError', [err]);
                }
            });
    });