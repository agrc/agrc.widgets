define([
    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'dojo/dom-class',
    'dojo/dom-construct',
    'dojo/dom-geometry',
    'dojo/dom-style',
    'dojo/hash',
    'dojo/io-query',

    'dojo/aspect',
    'dojo/dom',

    'dijit/Destroyable',
    'dijit/form/Button',

    'esri/config',
    'esri/geometry/Extent',
    'esri/geometry/Point',
    'esri/layers/ArcGISTiledMapServiceLayer',
    'esri/map',
    'esri/toolbars/navigation',

    'spin'

], function(
    array,
    declare,
    lang,

    domClass,
    domConstruct,
    domGeometry,
    domStyle,
    hash,
    ioQuery,

    aspect,
    dom,

    Destroyable,
    Button,

    esriConfig,
    Extent,
    Point,
    ArcGISTiledMapServiceLayer,
    esriMap,
    Navigation,

    Spinner
) {
    return declare([esriMap, Destroyable], {
        // description:
        //      **Summary**: Map Control with default functionality specific to State of Utah data. Extends esri.Map.
        //      <p></p>
        //      **Owner(s)**: Scott Davis
        //      <p></p>
        //      **Test Page**: <a href='/tests/dojo/agrc/1.0/agrc/widgets/tests/BaseMapTests.html' target='_blank'>
        //          agrc.widgets.map.BaseMap.Tests</a>
        //      <p></p>
        //      **Description**:
        //      <p>
        //      This widget does not inherit from dijit._Widget like most of the other agrc widgets.
        //      It inherits from an esri control, esri.Map. Please see
        //      [their documentation](http://help.arcgis.com/en/webapi/javascript/arcgis/jsapi/map-amd.html).
        //      This widget automatically adds code to handle window resizing and replaces the ESRI logo with
        //      the AGRC logo. It defaults to the State of Utah extent on load. You can easily make a
        //      loader image appear when a certain layer is drawing. See addLoaderToLayer.
        //      </p>
        //      <p>
        //      **Published Topics**:
        //      </p>
        //      <ul><li>None</li>
        //      </ul>
        //      <p>
        //      **Exceptions**:
        //      </p>
        //      <ul><li>None</li></ul>
        //      <p>
        //      **Required Files**:
        //      </p>
        //      <ul><li>resources/map/BaseMap.css</li></ul>
        // example:
        // |    var map = new BaseMap('basemap-div');
        //
        // example:
        // |    var options = {
        // |        useDefaultExtent: false,
        // |        useDefaultBaseMap: false,
        // |        defaultBaseMap: 'Terrain'
        // |    };
        // |    var map = new BaseMap('basemap-div', options);

        // _layersDrawing: [private] Integer
        //      keeps track of layers that have draw - see addLoadingToLayer
        _layersDrawing: 0,

        // _defaultExtent: esri.geometry.Extent
        //      set in constructor
        _defaultExtent: null,

        // _buttons: [private] Object
        //      Holds data for each of the buttons
        _buttons: {
            full: {
                id: 'full-extent-button',
                callback: function() {
                    this.onFullExtentButtonClicked();
                },
                title: 'Zoom to full extent'
            },
            back: {
                id: 'back-button',
                callback: function() {
                    this.onBackButtonClicked();
                },
                title: 'Go back to previous extent'
            }
        },

        // navBar: esri.toolbars.Navigation
        //      used for the back button
        navBar: null,

        // spinner: Object (Spinner)
        //      the spinner object returned by spinjs
        spinner: null,


        // Parameters to constructor

        // useDefaultBaseMap: Boolean
        //      If true, the map will automatically load the Vector map service
        //      Default: true
        useDefaultBaseMap: true,

        // defaultBaseMap: String
        //      The name of the AGRC base map cache that you want to add. (ie. Vector)
        //      Default: 'Vector'
        defaultBaseMap: 'Vector',

        // useDefaultExtent: Boolean
        //      If true, the map will automatically zoom to the state of Utah extent.
        //      Default: 'Vector'
        useDefaultExtent: true,

        // includeFullExtentButton: Boolean
        //      Controls the visibility of the full extent button below the zoom slider.
        //      Default: false.
        includeFullExtentButton: false,

        // includeBackButton: Boolean
        //      Controls the visibility of the back button below the zoom slider.
        //      Default: false.
        includeBackButton: false,

        // router: Boolean
        //      Toggles functionality to persist the map extent in the url.
        //      Default: false
        router: false,

        constructor: function(mapDiv, options) {
            // summary:
            //      Constructor function for object. This overrides the esri.Map method of the same name
            // mapDiv: String or DomNode
            //      The div that you want to put the map in.
            // options: Object?
            //      The parameters that you want to pass into the widget. Includes useDefaultBaseMap,
            //      useDefaultExtent, defaultBaseMap, and includeFullExtentButton. All are optional.
            console.log('agrc.widgets.map.BaseMap::constructor', arguments);

            if (!options) {
                options = {};
            }

            if (options.router) {
                lang.mixin(this._params, this.initRouter());
            }

            this._defaultExtent = new Extent({
                xmax: 696328,
                xmin: 207131,
                ymax: 4785283,
                ymin: 3962431,
                spatialReference: {
                    wkid: 26912
                }
            });

            // set default extent if no router was set
            if (!options.extent) {
                options.extent = this._defaultExtent;
                options.fitExtent = true;
            } else {
                this._defaultExtent = options.extent;
            }

            // mixin options
            lang.mixin(this, options);

            // load basemap
            if (this.useDefaultBaseMap) {
                this.showDefaultBaseMap();
            }

            // replace default link on logo
            esriConfig.defaults.map.logoLink = '//gis.utah.gov/';

            // not sure if this is needed?
            domClass.add(mapDiv, 'mapContainer');
        },
        setDefaultExtent: function() {
            // summary:
            //      Sets the extent to the State of Utah
            console.log('agrc.widgets.map.BaseMap::setDefaultExtent', arguments);

            return this.setExtent(this._defaultExtent);
        },
        showDefaultBaseMap: function() {
            // summary:
            //      Adds the UtahBaseMap-Vector map service.
            console.log('agrc.widgets.map.BaseMap::showDefaultBaseMap', arguments);

            this.addAGRCBaseMap(this.defaultBaseMap);
        },
        addLoaderToLayer: function(lyr) {
            // summary:
            //      Wires up the loader image to display when the passed layer is drawing.
            // lyr: esri.Layer
            //      The layer that you want to work with.
            console.log('agrc.widgets.map.BaseMap::addLoaderToLayer', arguments);

            var that = this;

            function showLoading() {
                // increment layersDrawing
                that._layersDrawing++;

                that.showLoader();
            }

            function hideLoading() {
                // decrement layersDrawing
                that._layersDrawing--;

                // only hide loader if all layers have finished drawing
                if (that._layersDrawing <= 0) {
                    that.hideLoader();
                }
            }

            // wire layer events
            this.own(
                aspect.before(lyr, 'onUpdateStart', showLoading),
                aspect.after(lyr, 'onUpdateEnd', hideLoading)
            );
        },
        showLoader: function() {
            // summary:
            //      Displays the loader icon in the bottom, left-hand corner of the map
            console.log('agrc.widgets.map.BaseMap::showLoader', arguments);

            var opts = {
                lines: 9, // The number of lines to draw
                length: 10, // The length of each line
                width: 4, // The line thickness
                radius: 5, // The radius of the inner circle
                corners: 1, // Corner roundness (0..1)
                rotate: 0, // The rotation offset
                direction: 1, // 1: clockwise, -1: counterclockwise
                color: '#ffffff', // #rgb or #rrggbb or array of colors
                speed: 1, // Rounds per second
                trail: 60, // Afterglow percentage
                shadow: true, // Whether to render a shadow
                hwaccel: true, // Whether to use hardware acceleration
                className: 'spinner', // The CSS class to assign to the spinner
                zIndex: 2e9, // The z-index (defaults to 2000000000)
                top: 'auto', // Top position relative to parent in px
                left: 'auto' // Left position relative to parent in px
            };

            if (!this.spinner) {
                this.spinner = new Spinner(opts).spin(dom.byId(this.root));
            } else {
                if (!this.spinner.el) {
                    // only start if it's not already started
                    this.spinner.spin(dom.byId(this.root));
                }
            }
        },
        hideLoader: function() {
            // summary:
            //      Hides the loader icon.
            console.log('agrc.widgets.map.BaseMap::hideLoader', arguments);

            this.spinner.stop();
        },
        addAGRCBaseMap: function(cacheName) {
            // summary:
            //      Add one of the AGRC basemaps to the map.
            // cacheName: String
            //      The name of the base map that you want to add. (ie. Vector)
            console.log('agrc.widgets.map.BaseMap::addAGRCBaseMap', arguments);

            // build basemap url
            var url = window.location.protocol +
                '//mapserv.utah.gov/ArcGIS/rest/services/BaseMaps/' + cacheName + '/MapServer';
            var lyr = new ArcGISTiledMapServiceLayer(url, {
                id: cacheName
            });
            this.addLayer(lyr);
        },
        _addButton: function(button, yOffset) {
            // summary:
            //      Adds the a below the zoom slider.
            // button: this._buttons
            // tags:
            //      private
            console.log('agrc.widgets.map.BaseMap::_addButton', arguments);

            // calculate button's top and left based on zoom slider size and position
            var mapSlider = dom.byId(this.id + '_zoom_slider');
            var left = domStyle.get(mapSlider, 'left') - 7;
            var sliderTop = domStyle.get(mapSlider, 'top');
            var sliderHeight = domGeometry.getContentBox(mapSlider).h;
            var top = sliderHeight + sliderTop + yOffset;

            // button container
            var container = domConstruct.create('div', {
                'class': 'button-container',
                style: {
                    top: top + 'px',
                    left: left + 'px'
                }
            }, this.container);

            new Button({
                id: this.id + '_' + button.id,
                'class': 'button',
                iconClass: 'button-icon ' + button.id + '-icon',
                showLabel: false,
                type: 'button',
                onClick: lang.hitch(this, button.callback),
                title: button.title
            }, domConstruct.create('button')).placeAt(container);
        },
        onLoad: function() {
            console.log('agrc.widgets.map.BaseMap::onLoad', arguments);

            if (this.includeFullExtentButton) {
                this.navBar = new Navigation(this);
            }

            if (this.includeFullExtentButton || this.includeBackButton) {
                // have to add timeout to allow the table to be built
                window.setTimeout(lang.hitch(this, function() {
                    var btns = [];
                    if (this.includeFullExtentButton) {
                        btns.push(this._buttons.full);
                    }
                    if (this.includeBackButton) {
                        btns.push(this._buttons.back);
                    }
                    var offset = 0;
                    array.forEach(btns, function(b) {
                        this._addButton(b, offset);
                        offset = offset + 26;
                    }, this);
                }), 1000);
            }
        },
        zoomToGeometry: function(geometry) {
            // summary:
            //      Zooms the map to any type of geometry
            // geometry: esri.Geometry
            console.log('agrc.widgets.map.BaseMap::zoomToGeometry', arguments);

            if (geometry.type === 'polygon' || geometry.type === 'polyline' || geometry.type === 'multipoint') {
                this.setExtent(geometry.getExtent(), true);
            } else {
                // point
                this.centerAndZoom(geometry, 10);
            }
        },
        onFullExtentButtonClicked: function() {
            // summary:
            //      description
            console.log('agrc.widgets.map.BaseMap::onFullExtentButtonClicked', arguments);

            return this.setDefaultExtent();
        },
        onBackButtonClicked: function() {
            // summary:
            //      description
            console.log('agrc.widgets.map.BaseMap::onBackButtonClicked', arguments);

            this.navBar.zoomToPrevExtent();
        },
        initRouter: function () {
            // summary:
            //      sets up the url router for persisting the map extent
            console.log('agrc.widgets.map.BaseMap::initRouter', arguments);

            var that = this;
            var urlObj = ioQuery.queryToObject(hash());
            var options = {
                scale: parseInt(urlObj.scale, 10),
                center: new Point({
                    x: parseInt(urlObj.x, 10),
                    y: parseInt(urlObj.y, 10),
                    spatialReference: {wkid: 26912}
                })
            };
            this.on('load', function () {
                if (urlObj.x && urlObj.y && urlObj.scale) {
                    that.setScale(options.scale);
                    that.centerAt(options.center);
                }
                that.on('extent-change', lang.hitch(that, 'updateExtentHash'));
            });

            return options;
        },
        updateExtentHash: function () {
            // summary:
            //      sets the extent props in the url hash
            console.log('agrc.widgets.map.BaseMap::updateExtentHash', arguments);
        
            var center = this.extent.getCenter();
            // mixin any existing url props to allow for other routers
            var newProps = lang.mixin(ioQuery.queryToObject(hash()), {
                x: Math.round(center.x),
                y: Math.round(center.y),
                scale: Math.round(this.getScale())
            });

            return hash(ioQuery.objectToQuery(newProps), true);
        }
    });
});
