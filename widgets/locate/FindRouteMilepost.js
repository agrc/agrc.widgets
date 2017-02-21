define([
    'dojo/text!agrc/widgets/locate/templates/FindRouteMilepost.html',

    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/Color',

    'dojo/dom-class',

    'dojo/string',
    'dojo/io/script',
    'dojo/when',
    'dojo/query',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',

    'esri/layers/GraphicsLayer',
    'esri/symbols/SimpleMarkerSymbol',
    'esri/graphic',
    'esri/geometry/Point',
    'esri/geometry/scaleUtils'
], function (
    template,

    declare,
    lang,
    Color,

    domClass,

    string,
    dojoScript,
    when,
    query,

    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,

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

        // inline: Boolean (optional)
        //      Controls if the form is inline or normal (default) layout
        inline: null,

        constructor: function () {
            console.log('agrc.widgets.locate.FindRouteMilepost::constructor', arguments);
        },
        postMixInProperties: function () {
            // summary:
            //      description
            console.log('agrc.widgets.locate.FindRouteMilepost::postMixinProperties', arguments);

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

            if (!this.wkid) {
                this.wkid = (this.map) ? this.map.spatialReference.wkid : 26912;
            }
        },
        postCreate: function () {
            // summary:
            //      dom is ready
            console.log('agrc.widgets.locate.FindRouteMilepost::postCreate', arguments);

            this.wireEvents();

            this.form.onsubmit = function () {
                return false;
            };

            if (this.inline) {
                domClass.add(this.form, 'form-inline');
            }
        },
        wireEvents: function () {
            // summary:
            //      wires the events for the widget
            console.log('agrc.widgets.locate.FindRouteMilepost::wireEvents', arguments);

            this.connect(this.findBtn, 'click', '_onFindClick');
        },
        _onFindClick: function () {
            // summary:
            //      description
            console.log('agrc.widgets.locate.FindRouteMilepost::_onFindClick', arguments);

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
            console.log('agrc.widgets.locate.FindRouteMilepost::_validate', arguments);

            // hide error messages
            query('.form-group', this.domNode).removeClass('has-error');

            function validate(textBox) {
                if (lang.trim(textBox.value) === '') {
                    domClass.add(textBox.parentElement, 'has-error');
                    return false;
                } else {
                    return true;
                }
            }

            if (!validate(this.routeTxt)) {
                return false;
            } else if (!validate(this.milepostTxt)) {
                return false;
            } else {
                return true;
            }
        },
        _invokeWebService: function () {
            // summary:
            //      description
            // returned: Deferred
            console.log('agrc.widgets.locate.FindRouteMilepost::_invokeWebService', arguments);
            var that = this;

            var url = '//api.mapserv.utah.gov/api/v1/geocode/milepost/${route}/${milepost}?' +
                'apiKey=${key}&spatialReference=${sr}';
            var params = {
                url: string.substitute(url, {
                    milepost: this.milepostTxt.value,
                    route: this.routeTxt.value,
                    key: this.apiKey,
                    sr: this.wkid
                }),
                handleAs: 'json',
                timeout: this.xhrTimeout,
                preventCache: true,
                callbackParamName: 'callback'
            };
            var def = dojoScript.get(params);

            when(def, function (response) {
                if (response.status !== 200) {
                    that._onXHRFailure();
                    def.reject();
                }
                that._onXHRSuccess(response);
            }, function (/*er*/) {
                that._onXHRFailure();
            });

            return def;
        },
        _onXHRSuccess: function (result, noZoom) {
            // summary:
            //      callback for service
            // result: {}
            console.log('agrc.widgets.locate.FindRouteMilepost::_onXHRSuccess', arguments);

            var graphic;

            // TODO: check for server error after upgrading to new web api
            var location = result.result.location;
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
        _onXHRFailure: function () {
            // summary:
            //      description
            console.log('agrc.widgets.locate.FindRouteMilepost::_onXHRFailure', arguments);

            domClass.add(this.errorMsg.parentElement, 'has-error');
        },
        onFind: function (/*result*/) {
            // summary:
            //      Event that fires when the service successfully returns a point
            // result: {}
            console.log('agrc.widgets.locate.FindRouteMilepost::onFind', arguments);
        }
    });
});
