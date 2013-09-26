define([
        'dojo/_base/array',
        'dojo/_base/declare',
        'dojo/_base/lang',

        'dojo/dom-class',
        'dojo/dom-construct',
        'dojo/dom-geometry',
        'dojo/dom-style',

        'dojo/aspect',
        'dojo/dom',

        'dijit/Destroyable',
        'dijit/form/Button',

        'esri/config',
        'esri/domUtils',
        'esri/geometry/Extent',
        'esri/layers/ArcGISTiledMapServiceLayer',
        'esri/map',
        'esri/toolbars/navigation',

        '../../resources/libs/spin'

    ],

    function(
        array,
        declare,
        lang,

        domClass,
        domConstruct,
        domGeometry,
        domStyle,

        aspect,
        dom,

        Destroyable,
        Button,

        esriConfig,
        domUtils,
        Extent,
        ArcGISTiledMapServiceLayer,
        esriMap,
        Navigation,

        Spinner
    ) {
        return declare('agrc/widgets/map/BaseMap', [esriMap, Destroyable], {
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
            useDefaultBaseMap: true,

            // defaultBaseMap: String
            //      The name of the AGRC base map cache that you want to add. (ie. Vector)
            defaultBaseMap: 'Vector',

            // useDefaultExtent: Boolean
            //      If true, the map will automatically zoom to the state of Utah extent.
            useDefaultExtent: true,

            // includeFullExtentButton: Boolean
            //      Controls the visibility of the full extent button below the zoom slider.
            //      Defaults to false.
            includeFullExtentButton: false,

            // includeBackButton: Boolean
            //      Controls the visibility of the back button below the zoom slider.
            //      Defaults to false.
            includeBackButton: false,

            constructor: function(mapDiv, options) {
                // summary:
                //      Constructor function for object. This overrides the esri.Map method of the same name
                // mapDiv: String or DomNode
                //      The div that you want to put the map in.
                // options: Object?
                //      The parameters that you want to pass into the widget. Includes useDefaultBaseMap,
                //      useDefaultExtent, defaultBaseMap, and includeFullExtentButton. All are optional.
                console.log(this.declaredClass + "::constructor", arguments);

                if (!options) {
                    options = {};
                }

                this._defaultExtent = new Extent({
                    xmin: 81350,
                    ymin: 3962431,
                    xmax: 800096,
                    ymax: 4785283,
                    spatialReference: {
                        wkid: 26912
                    }
                });

                // set default extent
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
                esriConfig.defaults.map.logoLink = "http://gis.utah.gov/";

                // not sure if this is needed?
                domClass.add(mapDiv, 'mapContainer');
            },
            setDefaultExtent: function() {
                // summary:
                //      Sets the extent to the State of Utah
                console.log(this.declaredClass + "::setDefaultExtent", arguments);

                this.setExtent(this._defaultExtent);
            },
            showDefaultBaseMap: function() {
                // summary:
                //      Adds the UtahBaseMap-Vector map service.
                console.log(this.declaredClass + "::showDefaultBaseMap", arguments);

                this.addAGRCBaseMap(this.defaultBaseMap);
            },
            addLoaderToLayer: function(lyr) {
                // summary:
                //      Wires up the loader image to display when the passed layer is drawing.
                // lyr: esri.Layer
                //      The layer that you want to work with.
                console.log(this.declaredClass + "::addLoaderToLayer", arguments);

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
                    aspect.before(lyr, "onUpdateStart", showLoading),
                    aspect.after(lyr, "onUpdateEnd", hideLoading)
                );
            },
            showLoader: function() {
                // summary:
                //      Displays the loader icon in the bottom, left-hand corner of the map
                console.log(this.declaredClass + "::showLoader", arguments);


                var opts = {
                    lines: 10, // The number of lines to draw
                    length: 7, // The length of each line
                    width: 3, // The line thickness
                    radius: 8, // The radius of the inner circle
                    corners: 1, // Corner roundness (0..1)
                    rotate: 0, // The rotation offset
                    direction: 1, // 1: clockwise, -1: counterclockwise
                    speed: 1, // Rounds per second
                    trail: 60, // Afterglow percentage
                    // shadow: true, // Whether to render a shadow
                    hwaccel: true, // Whether to use hardware acceleration
                    color: "#323232"
                };

                if (!this.spinner) {
                    this.spinner = new Spinner(opts).spin(dom.byId(this.id));
                } else {
                    if (!this.spinner.el) {
                        // only start if it's not already started
                        this.spinner.spin(dom.byId(this.id));
                    }
                }
            },
            hideLoader: function() {
                // summary:
                //      Hides the loader icon.
                console.log(this.declaredClass + "::hideLoader", arguments);

                this.spinner.stop();
            },
            addAGRCBaseMap: function(cacheName) {
                // summary:
                //      Add one of the AGRC basemaps to the map.
                // cacheName: String
                //      The name of the base map that you want to add. (ie. Vector)
                console.log(this.declaredClass + "::addAGRCBaseMap", arguments);

                // build basemap url
                var url = 'http://mapserv.utah.gov/ArcGIS/rest/services/BaseMaps/' + cacheName + '/MapServer';
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
                console.log(this.declaredClass + "::_addButton", arguments);

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
                    "class": 'button',
                    iconClass: 'button-icon ' + button.id + '-icon',
                    showLabel: false,
                    type: 'button',
                    onClick: lang.hitch(this, button.callback),
                    title: button.title
                }, domConstruct.create('button')).placeAt(container);
            },
            onLoad: function() {
                console.log(this.declaredClass + "::onLoad", arguments);

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
                console.log(this.declaredClass + "::zoomToGeometry", arguments);

                if (geometry.type === "polygon" || geometry.type === "polyline" || geometry.type === "multipoint") {
                    this.setExtent(geometry.getExtent(), true);
                } else {
                    // point
                    this.centerAndZoom(geometry, 10);
                }
            },
            onFullExtentButtonClicked: function() {
                // summary:
                //      description
                console.log(this.declaredClass + "::onFullExtentButtonClicked", arguments);

                this.setDefaultExtent();
            },
            onBackButtonClicked: function() {
                // summary:
                //      description
                console.log(this.declaredClass + "::onBackButtonClicked", arguments);

                this.navBar.zoomToPrevExtent();
            }
        });
    });