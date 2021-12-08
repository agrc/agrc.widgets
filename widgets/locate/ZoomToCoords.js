define([
    'dojo/text!agrc/widgets/locate/templates/ZoomToCoords.html',

    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/_base/event',

    'dojo/query',
    'dojo/number',
    'dojo/on',
    'dojo/aspect',

    'dojo/dom-attr',
    'dojo/dom-class',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',

    'esri/tasks/GeometryService',
    'esri/geometry/Point',
    'esri/SpatialReference',


    'dojo/Stateful'
], function (
    template,

    declare,
    lang,
    array,
    events,

    query,
    number,
    on,
    aspect,

    domAttr,
    domClass,

    _WidgetBase,
    _TemplatedMixin,

    GeometryService,
    Point,
    SpatialReference
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // summary:
        //      Zooms the map to different coordinates
        //      If the input map is in the same spatial reference
        //      the map is zoomed, otherwise the point is reprojected
        //      using the geometry service url
        // example:
        // |    var widget = new ZoomToCoords({
        // |        map: map
        // |    }, "node");

        templateString: template,

        baseClass: 'zoom-to-coordinate',

        // _panelController: {key: DomNode}
        // summary:
        //      an object has of domnodes that contain the
        //      coorindate form elements
        _panelController: null,

        // _geometryService: esri/task/esriGeometryService
        // summary:
        //      the service for interacting with the ags geometry service
        _geometryService: null,

        // zoomLevel: Number
        // summary:
        //      the cache level to zoom the map to
        zoomLevel: 12,
        // urls: {key: url}
        // summary:
        //      holds urls that are important to this class
        urls: {
            geometryService: window.location.protocol +
                '//mapserv.utah.gov/arcgis/rest/services/Geometry/GeometryServer'
        },

        // Properties to be sent into constructor

        // map: esri/map
        // summary:
        //      the map to zoom
        map: null,

        postCreate: function () {
            // summary:
            //    Overrides method of same name in dijit._Widget.
            console.log('agrc.widgets.locate.ZoomToCoords::postCreate', arguments);

            if (!this.map) {
                throw 'This widget requires an esri/map to be useful.';
            }

            this._panelController = {
                panels: {
                    utm: this.utmNode,
                    dm: this.dmNode,
                    dms: this.dmsNode,
                    dd: this.ddNode
                },
                hideAllBut: function (showMe) {
                    for (var prop in this.panels) {
                        if (this.panels.hasOwnProperty(prop)) {
                            if (showMe && prop === showMe) {
                                domClass.replace(this.panels[prop], 'show', 'hide');
                                this.visible = this.panels[prop];
                                continue;
                            }

                            domClass.replace(this.panels[prop], 'hide', 'show');
                        }
                    }
                },
                visible: this.utmNode
            };

            this.set('valid', false);

            this._geometryService = new GeometryService(this.urls.geometryService);

            this._setupConnections();
        },
        zoom: function () {
            // summary:
            //      zooms the map to the point created by _getPoint
            //  summary:
            //      the point created by the user input or returned by
            //      the geometry service
            console.log('agrc.widgets.locate.ZoomToCoords::zoom', arguments);

            if (!this.map) {
                throw 'This widget requires an esri/map to be useful.';
            }

            // disable zoom button
            domClass.add(this.zoomNode, 'disabled');
            domAttr.set(this.zoomNode, 'disabled', true);

            // reset errors
            domClass.remove(this.errorNode, ['alert', 'alert-danger', 'text-center']);
            this.errorNode.innerHTML = '';

            var point = this._getPoint();

            if (point.spatialReference.wkid === this.map.spatialReference.wkid) {
                this.map.centerAndZoom(point, this.zoomLevel);

                this.emit('zoom', {
                    bubbles: true,
                    cancelable: true,
                    point: point
                });

                // enable zoom button
                domClass.remove(this.zoomNode, 'disabled');
                domAttr.remove(this.zoomNode, 'disabled');

                return;
            }

            this._geometryService.project([point], this.map.spatialReference);
        },
        _setupConnections: function () {
            // summary:
            //      place to wire events and such
            //
            console.log('agrc.widgets.locate.ZoomToCoords::_setupConnections', arguments);

            this.own(
                on(this.domNode, 'input:change', lang.hitch(this, '_validate')),
                on(this.domNode, 'input:input', lang.hitch(this, '_validate')),
                on(this.formNode, 'submit', function (evt) {
                    events.stop(evt);
                }),
                on(this._geometryService,
                    'project-complete',
                    lang.hitch(this, '_projectionComplete'),
                    lang.hitch(this, '_displayError')
                )
            );

            this.watch('valid', lang.hitch(this, '_enableZoom'));
            aspect.after(this, '_updateView', lang.hitch(this, '_validate'));
        },
        _updateView: function (evt) {
            // summary:
            //      handles the click event of the coordinate system buttons
            // evt
            console.log('agrc.widgets.locate.ZoomToCoords::_updateView', arguments);

            this._panelController.hideAllBut(evt.target.value);
        },
        _getPoint: function () {
            // summary:
            //      creates a point from the user input
            console.log('agrc.widgets.locate.ZoomToCoords::_getPoint', arguments);

            var getValue = function (input, match) {
                var value = array.filter(input, function (node) {
                    return node.name === match;
                })[0].value;

                return number.parse(lang.trim(value));
            };

            var inputs = query('[data-required="true"]', this._panelController.visible);
            var sr = new SpatialReference({
                wkid: 4326
            });
            var point = null;
            var x = null;
            var y = null;
            var xm = null;
            var ym = null;
            var xs = null;
            var ys = null;

            switch (this._panelController.visible) {
                case this.utmNode:
                    sr = new SpatialReference({
                        wkid: 26912
                    });

                    x = getValue(inputs, 'x');
                    y = getValue(inputs, 'y');

                    point = new Point(x, y, sr);

                    break;
                case this.ddNode:
                    x = Math.abs(getValue(inputs, 'x'));
                    y = getValue(inputs, 'y');

                    point = new Point(-x, y, sr);

                    break;
                case this.dmNode:
                    x = Math.abs(getValue(inputs, 'x'));
                    y = getValue(inputs, 'y');
                    xm = getValue(inputs, 'xm') / 60;
                    ym = getValue(inputs, 'ym') / 60;

                    point = new Point(-(x + xm), y + ym, sr);

                    break;
                case this.dmsNode:
                    x = Math.abs(getValue(inputs, 'x'));
                    y = getValue(inputs, 'y');
                    xm = getValue(inputs, 'xm') / 60;
                    ym = getValue(inputs, 'ym') / 60;
                    xs = getValue(inputs, 'xs') / 3600;
                    ys = getValue(inputs, 'ys') / 3600;

                    point = new Point(-(x + xm + xs), (y + ym + ys), sr);

                    break;
            }

            return point;
        },
        _validate: function () {
            // summary:
            //      validates the inputs from the node
            console.log('agrc.widgets.locate.ZoomToCoords::_validate', arguments);

            var valid = false;
            var inputs = query('[data-required="true"]', this._panelController.visible);

            //reset validation
            inputs.forEach(function (node) {
                domClass.remove(node.parentElement, 'has-error');
                domClass.remove(node.parentElement, 'has-success');
            });

            //filter inputs to get bad ones
            var problems = array.filter(inputs, function (node) {
                var value = lang.trim(node.value);
                if (!value ||
                    lang.trim(value) === '' || isNaN(number.parse(value))) {
                    domClass.add(node.parentElement, 'has-error');
                    return true;
                } else {
                    domClass.add(node.parentElement, 'has-success');
                    return false;
                }
            });

            valid = problems.length === 0;

            this.set('valid', valid);

            return valid;
        },
        _enableZoom: function (prop, old, value) {
            // summary:
            //      if validate returns true, enable the zoom button
            // valid
            console.log('agrc.widgets.locate.ZoomToCoords::_enableZoom', arguments);

            if (!value) {
                domClass.add(this.zoomNode, 'disabled');
                domAttr.set(this.zoomNode, 'disabled', true);

                return;
            }

            domClass.remove(this.zoomNode, 'disabled');
            domAttr.remove(this.zoomNode, 'disabled');
        },
        _projectionComplete: function (response) {
            // summary:
            //      callback function to the geometryservice project method
            // response: [esri.Geometry]
            console.log('agrc.wigets.locate.ZoomToCoords::_projectionComplete', arguments);

            domClass.remove(this.zoomNode, 'disabled');
            domAttr.remove(this.zoomNode, 'disabled');

            if (!response || !response.geometries) {
                this._displayError('There was an issue projecting your point.');
            }

            var point = response.geometries[0];

            if (isNaN(point.x)) {
                this._displayError('There was an issue projecting your point.');
            }

            this.map.centerAndZoom(point, this.zoomLevel);

            this.emit('zoom', {
                bubbles: true,
                cancelable: true,
                point: point
            });
        },
        _displayError: function (value) {
            // summary:
            //      handles errors
            console.log('agrc.widgets.locate.ZoomToCoords::_displayError', arguments);

            domClass.remove(this.zoomNode, 'disabled');
            domAttr.remove(this.zoomNode, 'disabled');

            domClass.add(this.errorNode, ['alert', 'alert-danger', 'text-center']);

            this.errorNode.innerHTML = value;
        },
        forcePositive: function (event) {
            // summary:
            //      forces the input to be positive
            console.log('agrc.widgets.locate.ZoomToCoords:forcePositive', arguments);

            if (!event.target.value.endsWith('.') && parseFloat(event.target.value) === parseFloat(event.target.value)) {
                event.target.value = Math.abs(event.target.value);
            }
        }
    });
});
