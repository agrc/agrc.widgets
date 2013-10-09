define([
        'dojo/text!agrc/widgets/locate/templates/FindRouteMilepost.html',

        'dijit/_WidgetBase',
        'dijit/_TemplatedMixin',
        'dijit/_WidgetsInTemplateMixin',

        'dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/_base/Color',

        'dojo/dom-style',

        'dojo/string',
        'dojo/io/script',
        'dojo/when',

        'esri/layers/GraphicsLayer',
        'esri/symbols/SimpleMarkerSymbol',
        'esri/Graphic',
        'esri/geometry/Point',
        'esri/geometry/scaleUtils'
    ],

    function(
        template,

        _WidgetBase,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,

        declare,
        lang,
        Color,

        domStyle,

        string,
        dojoScript,
        when,

        GraphicsLayer,
        SimpleMarkerSymbol,
        Graphic,
        Point,
        scaleUtils
    ) {
        return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
            widgetsInTemplate: false,
            templateString: template,
            baseClass: 'find-route-milepost',

            // xhrTimeout: Number
            //      Amount of time that the xhr request waits before giving up
            //      This should be dramatically shortened or removed all together
            //      after upgrading to the new web api since it will fail immediately
            xhrTimeout: 5000,

            // zoomLevel: Number
            //      The default zoom level that the map is zoomed to upon successfully
            //      finding a route and milepost
            zoomLevel: 6,

            // parameters passed in via the constructor


            // map: esri.Map [optional]
            //      The associated map that will be auto-zoomed to the found point
            map: null,

            // graphicsLayer: esri.layers.GraphicsLayer [optional]
            //      The graphics layer that the widget will place the found point in
            graphicsLayer: null,

            // symbol: esri.symbol.SimpleMarkerSymbol [optional]
            //      The symbol used for the found graphic
            symbol: null,

            //apiKey: string
            //      Register for your api key at developer.mapserv.utah.gov
            apiKey: null,

            constructor: function() {
                console.log(this.declaredClass + "::constructor", arguments);
            },
            postMixInProperties: function() {
                // summary:
                //      description
                console.log(this.declaredClass + "::postMixinProperties", arguments);

                if (this.map && !this.graphicsLayer) {
                    this.graphicsLayer = new GraphicsLayer();
                    this.map.addLayer(this.graphicsLayer);
                }

                // create symbol if none was provided in options
                if (!this.symbol && this.map) {
                    this.symbol = new SimpleMarkerSymbol();
                    this.symbol.setStyle(SimpleMarkerSymbol.STYLE_DIAMOND);
                    this.symbol.setColor(new Color([255, 0, 0, 0.5]));
                }
            },
            postCreate: function() {
                // summary:
                //      dom is ready
                console.log(this.declaredClass + "::postCreate", arguments);

                this.wireEvents();
            },
            wireEvents: function() {
                // summary:
                //      wires the events for the widget
                console.log(this.declaredClass + "::wireEvents", arguments);

                this.connect(this.findBtn, 'click', '_onFindClick');
            },
            _onFindClick: function() {
                // summary:
                //      description
                console.log(this.declaredClass + "::_onFindClick", arguments);

                if (this.graphicsLayer) {
                    this.graphicsLayer.clear();
                }

                if (this._validate()) {
                    return this._invokeWebService();
                }
            },
            _validate: function() {
                // summary:
                //      validates the values in the text boxes
                // returns: Boolean
                console.log(this.declaredClass + "::_validate", arguments);

                function validate(textBox, invalidSpan) {
                    if (lang.trim(textBox.value) === '') {
                        domStyle.set(invalidSpan, 'display', 'inline');
                        return false;
                    } else {
                        domStyle.set(invalidSpan, 'display', 'none');
                        return true;
                    }
                }

                // hide error message
                domStyle.set(this.errorMsg, 'display', 'none');

                if (!validate(this.routeTxt, this.routeInvalid)) {
                    return false;
                } else if (!validate(this.milepostTxt, this.milepostInvalid)) {
                    return false;
                } else {
                    return true;
                }
            },
            _invokeWebService: function() {
                // summary:
                //      description
                // returned: Deferred
                console.log(this.declaredClass + "::_invokeWebService", arguments);
                var that = this;

                var url = 'http://api.mapserv.utah.gov/api/v1/geocode/milepost/${route}/${milepost}?apiKey=${key}';
                var params = {
                    url: string.substitute(url, {
                        milepost: this.milepostTxt.value,
                        route: this.routeTxt.value,
                        key: this.apiKey
                    }),
                    handleAs: 'json',
                    timeout: this.xhrTimeout,
                    preventCache: true,
                    callbackParamName: 'callback'
                };
                var def = dojoScript.get(params);

                when(def, function(response) {
                    if (response.status !== 200) {
                        that._onXHRFailure();
                        def.reject();
                    }
                    that._onXHRSuccess(response);
                }, function(er) {
                    that._onXHRFailure();
                });

                return def;
            },
            _onXHRSuccess: function(result, noZoom) {
                // summary:
                //      callback for service
                // result: {}
                console.log(this.declaredClass + "::_onXHRSuccess", arguments);

                var graphic;

                // TODO: check for server error after upgrading to new web api
                var location = result.result.location;
                location.UTM_X = location.x;
                location.UTM_Y = location.y;
                this.onFind(location);

                if (this.map) {
                    var pnt = new Point(result.result.location.x, result.result.location.y, this.map.spatialReference);

                    if (!noZoom) {
                        if (this.map.getLevel() > -1) {
                            this.map.centerAndZoom(pnt, this.zoomLevel);
                        } else { 
                            this.map.centerAndZoom(pnt, scaleUtils.getScale(this.map) / this.zoomLevel);
                        }
                    }

                    graphic = new Graphic(pnt, this.symbol);
                    this.graphicsLayer.add(graphic);
                }
            },
            _onXHRFailure: function() {
                // summary:
                //      description
                console.log(this.declaredClass + "::_onXHRFailure", arguments);

                domStyle.set(this.errorMsg, 'display', 'inline');
            },
            onFind: function(result) {
                // summary:
                //      Event that fires when the service successfully returns a point
                // result: {}
                console.log(this.declaredClass + "::onFind", arguments);
            }
        });
    });