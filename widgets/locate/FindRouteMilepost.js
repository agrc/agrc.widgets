define([
    'dojo/_base/declare', 
    'dijit/_WidgetBase', 
    'dijit/_TemplatedMixin', 
    'dijit/_WidgetsInTemplateMixin',
    'dojo/text!agrc/widgets/locate/templates/FindRouteMilepost.html',
    'dojo/dom-style',
    'dojo/io/script',
    'dojo/string'

],

function (
    declare, 
    _WidgetBase, 
    _TemplatedMixin, 
    _WidgetsInTemplateMixin, 
    template,
    domStyle,
    dojoScript,
    string
    ) {
    "use strict";
    return declare('agrc.widgets.locate.FindRouteMilepost', [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
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


        constructor: function () {
            console.log(this.declaredClass + "::constructor", arguments);
        },
        postMixInProperties: function () {
            // summary:
            //      description
            console.log(this.declaredClass + "::postMixinProperties", arguments);
        
            if (this.map && !this.graphicsLayer) {
                this.graphicsLayer = new esri.layers.GraphicsLayer();
                this.map.addLayer(this.graphicsLayer);
            }

            // create symbol if none was provided in options
            if (!this.symbol && this.map) {
                this.symbol = new esri.symbol.SimpleMarkerSymbol();
                this.symbol.setStyle(esri.symbol.SimpleMarkerSymbol.STYLE_DIAMOND);
                this.symbol.setColor(new dojo.Color([255, 0, 0, 0.5]));
            }
        },
        postCreate: function () {
            // summary:
            //      dom is ready
            console.log(this.declaredClass + "::postCreate", arguments);

            this.wireEvents();
        },
        wireEvents: function () {
            // summary:
            //      wires the events for the widget
            console.log(this.declaredClass + "::wireEvents", arguments);
        
            this.connect(this.findBtn, 'click', '_onFindClick');
        },
        _onFindClick: function () {
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
        _validate: function () {
            // summary:
            //      validates the values in the text boxes
            // returns: Boolean
            console.log(this.declaredClass + "::_validate", arguments);

            function validate (textBox, invalidSpan) {
                if (textBox.value.trim() === '') {
                    domStyle.set(invalidSpan, 'display', 'inline');
                    return false;
                } else {
                    domStyle.set(invalidSpan, 'display', 'none');
                    return true;
                }
            }

            if (!validate(this.routeTxt, this.routeInvalid)) {
                return false;
            } else if (!validate(this.milepostTxt, this.milepostInvalid)) {
                return false;
            } else {
                return true;
            }
        },
        _invokeWebService: function () {
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
                    key: AGRCGLOBAL.apiKey
                }),
                handleAs: 'json',
                timeout: this.xhrTimeout,
                preventCache: true,
                callbackParamName: 'callback'
            };
            var def = dojoScript.get(params);

            dojo.when(def, function (response) {
                if (response.status !== 200) {
                    def.reject();
                }
                that._onXHRSuccess(response);
            }, function (er) {
                that._onXHRFailure(er);
            });

            return def;
        },
        _onXHRSuccess: function (result, noZoom) {
            // summary:
            //      callback for service
            // result: {}
            console.log(this.declaredClass + "::_onXHRSuccess", arguments);

            var graphic;
        
            // TODO: check for server error after upgrading to new web api
            this.onFind(result);

            if (this.map) {
                var pnt = new esri.geometry.Point(result.result.location.x, result.result.location.y, this.map.spatialReference);

                if (!noZoom) {
                    if (this.map.getLevel() > -1) {
                        this.map.centerAndZoom(pnt, this.zoomLevel);
                    } else {
                        this.map.centerAndZoom(pnt, esri.geometry.getScale(
                            this.map.extent, this.map.width, this.map.spatialReference.wkid) / this.zoomLevel);
                    }
                }

                graphic = new esri.Graphic(pnt, this.symbol);
                this.graphicsLayer.add(graphic);
            }
        },
        _onXHRFailure: function () {
            // summary:
            //      description
            console.log(this.declaredClass + "::_onXHRFailure", arguments);
        
            alert('No match found!');
        },
        onFind: function (result) {
            // summary:
            //      Event that fires when the service successfully returns a point
            // result: {}
            console.log(this.declaredClass + "::onFind", arguments);
        }
    });
});