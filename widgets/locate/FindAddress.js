define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dojo/text!agrc/widgets/locate/templates/FindAddress.html',
    'agrc/modules/EsriLoader!esri/request',
    'dojo/topic',
    'dojo/dom-style',
    'dojo/_base/Color',
    'dojo/when',
    'dojo/_base/lang',
    'dojo/on',
    'dojo/string',
    'agrc/modules/EsriLoader!esri/symbols/SimpleMarkerSymbol',
    'agrc/modules/EsriLoader!esri/geometry/Point',
    'agrc/modules/EsriLoader!esri/geometry/scaleUtils',
    'agrc/modules/EsriLoader!esri/graphic',
    'dojo/_base/array',
    'dojo/query',
    'dojo/dom-class'

],

function(
    declare,
    widgetBase,
    templatedMixin,
    template,
    esriRequest,
    topic,
    style,
    color,
    when,
    lang,
    on,
    dojoString,
    SimpleMarkerSymbol,
    Point,
    scaleUtils,
    Graphic,
    array,
    query,
    domClass
    ) {
    // description:
    //      **Summary**: A simple form tied to the map allowing a user to quickly zoom to an address.
    //      <p>
    //      **Owner(s)**: Scott Davis, Steve Gourley
    //      </p>
    //      <p>
    //      **Test Page**: <a href='/tests/dojo/agrc/1.0/agrc/widgets/tests/FindAddressTests.html' target='_blank'>
    //          agrc.widgets.map.FindAddress.Tests</a>
    //      </p>
    //      <p>
    //      **Description**:
    //      This widget hits the [agrc geocoding web service](http://gis.utah.gov/web-services/address-geolocator-2).
    //      </p>
    //      <p>
    //      **Published Topics**: (See the [Dojo Topic System](http://dojotoolkit.org/reference-guide/quickstart/topics.html))
    //      </p>
    //      <ul>
    //          <li>agrc.widgets.locate.FindAddress.OnFindStart[none]</li>
    //          <li>agrc.widgets.locate.FindAddress.OnFind[result]</li>
    //          <li>agrc.widgets.locate.FindAddress.OnFindError[err]</li>
    //      </ul>
    //      **Exceptions**:
    //      </p>
    //      <ul><li>none</li></ul>
    //      <p>
    //      **Required Files**:
    //      </p>
    //      <ul><li>resources/locate/FindAddress.css</li></ul>
    //
    // example:
    // |    new FindAddress({map: map}, 'test1');

    return declare('agrc.widgets.locate.FindAddress', [widgetBase, templatedMixin], {
        templateString: template,
        baseClass: 'find-address',
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
                this.symbol = new SimpleMarkerSymbol();
                this.symbol.setStyle(SimpleMarkerSymbol.STYLE_DIAMOND);
                this.symbol.setColor(new color([255, 0, 0, 0.5]));
            }
        },

        postCreate: function() {
            this.form_geocode.onsubmit = function() {
                return false;
            };

            on(this.btn_geocode, 'click', lang.hitch(this, 'geocodeAddress'));
        },

        geocodeAddress: function() {
            // summary:
            //      Geocodes the address if the text boxes validate.
            console.info(this.declaredClass + '::' + arguments.callee.nom);

            if (!this._validate()) {
                this._done();
                return false;
            }

            topic.publish('agrc.widgets.locate.FindAddress.OnFindStart');

            this._geocoding();

            if (this.map && this._graphic) {
                this.graphicsLayer.remove(this._graphic);
            }

            var address = this.txt_address.value;
            var zone = this.txt_zone.value;

            if (this.request) {
                this.request.cancel('duplicate in flight');
                this.request = null;
            }
            
            this.request = this._invokeWebService({ street: address, zone: zone }).then(
                lang.hitch(this, '_onFind'), lang.hitch(this, '_onError')
            );

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

            var url = "http://api.mapserv.utah.gov/api/v1/Geocode/{geocode.street}/{geocode.zone}";
            
            var options = {
                apiKey: this.apiKey
            };
            
            url = lang.replace(url, {geocode: geocode});

            return esriRequest({
                url: url,
                content: options,
                callbackParamName: 'callback'
            });
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

            var that = this;

            // hide error messages
            query('.form-group', this.domNode).removeClass('has-error');

            return array.every([
                this.txt_address,
                this.txt_zone
                ], 
                function (tb) {
                    return that._isValid(tb);
            });
        },

        _isValid: function(textBox) {
            // summary:
            //      validates that there are values in the textbox
            // textBox: TextBox Element
            console.log(this.declaredClass + "::_isValid", arguments);

            var valid = dojoString.trim(textBox.value).length > 0;

            if (!valid) {
                domClass.add(textBox.parentElement, 'has-error');
            }

            return valid;
        },

        _geocoding: function() {

        },

        _done: function() {

        },
        
        onFind: function() {
            
        },

        _onFind: function(response) {
            // summary:
            //      handles a successful geocode
            // description:
            //      zooms the map if there is one. publishes the result
            // tags:
            //      private
            console.info(this.declaredClass + "::" + arguments.callee.nom);

            if (response.status === 200) {
                this.onFind(response.result);

                if (this.map) {
                    var point = new Point(response.result.location.x, response.result.location.y, this.map.spatialReference);

                    if (this.map.getLevel() > -1) {
                        this.map.centerAndZoom(point, this.zoomLevel);
                    } else {
                        this.map.centerAndZoom(point, scaleUtils.getScale(this.map.extent, this.map.width, this.map.spatialReference.wkid) / this.zoomLevel);
                    }

                    this._graphic = new Graphic(point, this.symbol, response.result);
                    this.graphicsLayer.add(this._graphic);
                }

                this.done();

                topic.publish("agrc.widgets.locate.FindAddress.OnFind", [response.result]);
            } else {
                this._onError();
            }

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

            domClass.add(this.errorMsg.parentElement, 'has-error');

            // re-enable find button
            this._done();

            topic.publish('agrc.widgets.locate.FindAddress.OnFindError', [err]);
        }
    });
});