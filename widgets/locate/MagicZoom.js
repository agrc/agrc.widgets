define([
    'dojo/text!./templates/MagicZoom.html',

    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/Color',
    'dojo/_base/array',

    'dojo/dom-class',
    'dojo/dom-style',
    'dojo/dom-construct',

    'dojo/on',
    'dojo/query',
    'dojo/keys',
    'dojo/has',
    'dojo/mouse',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',

    'esri/tasks/query',
    'esri/tasks/QueryTask',
    'esri/layers/GraphicsLayer',
    'esri/symbols/SimpleFillSymbol',
    'esri/symbols/SimpleLineSymbol',
    'esri/symbols/SimpleMarkerSymbol',
    'esri/geometry/Multipoint',
    'esri/graphic',

    'spin',

    'agrc/modules/WebAPI',


    'dojo/_base/sniff'
], function (
    template,

    declare,
    lang,
    Color,
    array,

    domClass,
    domStyle,
    domConstruct,

    on,
    query,
    keys,
    has,
    mouse,

    _WidgetBase,
    _TemplatedMixin,

    Query,
    QueryTask,
    GraphicsLayer,
    SimpleFillSymbol,
    SimpleLineSymbol,
    SimpleMarkerSymbol,
    Multipoint,
    Graphic,

    Spinner,

    WebApi
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        templateString: template,

        // _deferred: [private] Dojo.Deferred
        //      Dojo.Deferred for canceling pending requests.
        _deferred: null,

        // _addingGraphic: [private] Boolean
        //      switch to prevent a new graphic from being cleared
        _addingGraphic: true,

        // _isOverTable: Boolean
        //      A switch to help with onBlur callback on search box.
        _isOverTable: false,

        // _timer: Number
        //      A timer to delay the search so that it doesn't fire too
        //      many times when typing quickly.
        _timer: null,

        // _spinTimer: Number
        //      A timer to delay the spinner from showing too soon
        _spinTimer: null,

        // _currentIndex: Integer
        //      The index of the currently selected item in the results.
        _currentIndex: 0,


        // Parameters to constructor

        // map: esri.Map
        //      esri.Map reference.
        map: null,

        // apiKey: String
        apiKey: '',

        // promptMessage: String
        //      The label that shows up in the promptMessage for the text box.
        promptMessage: '',

        // mapServiceURL: String
        //      The URL to the map service that you want to search.
        mapServiceURL: '',

        // searchField: String
        //      The field name that is to be searched.
        searchField: '',

        // zoomLevel: Integer
        //      The number of cache levels up from the bottom that you want to zoom to.
        zoomLevel: 5,

        // searchLayer: String
        searchLayer: 'SGID10.LOCATION.PlaceNamesGNIS2010',

        // maxResultsToDisplay: Integer
        //      The maximum number of results that will be displayed.
        //      If there are more, no results are displayed.
        maxResultsToDisplay: 20,

        // placeHolder: String
        //     The placeholder text in the text box
        placeHolder: 'Map Search...',

        // outFields: String[]
        //      The outFields parameter in the esri.tasks.Query.
        //      If set to null, then only the searchField will be added.
        outFields: null,

        // contextField: String
        //      A second field to display in the results table to
        //      give context to the results in case of duplicate results.
        contextField: null,

        // symbolFill: esri.symbol (optional)
        //      esri.symbol zoom graphic symbol for polygons.
        symbolFill: null,

        // symbolLine: esri.symbol (optional)
        //     esri.symbol zoom graphic symbol for polylines.
        symbolLine: null,

        // symbolPoint: esri.symbol (optional)
        //      esri.symbol zoom graphic symbol for points.
        symbolPoint: null,

        // graphicsLayer: esri/layers/GraphicsLayer (optional)
        //      If provided, this is the graphics layer that this widget will use.
        //      The widget assumes that if you provide your own graphics layer then
        //      it is already added to the map.
        //      If not, then it will create it's own layer and add it to the map.
        graphicsLayer: null,

        // preserveGraphics: Boolean (optional)
        //      Set to true if you want the graphics to persist after map navigation.
        preserveGraphics: false,

        postCreate: function () {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('agrc.widgets.locate.MagicZoom::postCreate', arguments);

            this._setUpQueryTask();
            this._wireEvents();
            this._setUpGraphicsLayer();
            this.webApi = new WebApi({
                apiKey: this.apiKey
            });
            var opts = {
                lines: 9, // The number of lines to draw
                length: 4, // The length of each line
                width: 3, // The line thickness
                radius: 4, // The radius of the inner circle
                corners: 1, // Corner roundness (0..1)
                rotate: 0, // The rotation offset
                direction: 1, // 1: clockwise, -1: counterclockwise
                color: '#000', // #rgb or #rrggbb or array of colors
                speed: 1, // Rounds per second
                trail: 60, // Afterglow percentage
                shadow: false, // Whether to render a shadow
                hwaccel: true, // Whether to use hardware acceleration
                className: 'spinner', // The CSS class to assign to the spinner
                zIndex: 2e9, // The z-index (defaults to 2000000000)
                top: 'auto', // Top position relative to parent in px
                left: 'auto' // Left position relative to parent in px
            };
            this.spinner = new Spinner(opts);
        },
        showSpinner: function () {
            // summary:
            //      sets up and shows the spinner
            console.log('agrc.widgets.locate.MagicZoom::showSpinner', arguments);

            domStyle.set(this.searchIconSpan, 'display', 'none');

            if (!this.spinner.el) {
                // only start if it's not already started
                this.spinner.spin(this.spinnerDiv);
            }
        },
        hideSpinner: function () {
            // summary:
            //      hides the spinner and shows the search icon again
            console.log('agrc.widgets.locate.MagicZoom::hideSpinner', arguments);

            clearTimeout(this._spinTimer);
            this.spinner.stop();
            domStyle.set(this.searchIconSpan, 'display', 'inline');
        },
        _setUpQueryTask: function () {
            // summary:
            //      Sets up the esri QueryTask.
            // tags:
            //      private
            console.log('agrc.widgets.locate.MagicZoom::_setUpQueryTask', arguments);

            var outFields;
            if (this.outFields) {
                outFields = this.outFields;
            } else if (this.contextField) {
                outFields = [this.searchField, this.contextField];
            } else {
                outFields = [this.searchField];
            }
            this.outFields = outFields;

        },
        _setUpGraphicsLayer: function () {
            // summary:
            //      Sets up the graphics layer and associated symbols.
            // tags:
            //      private
            console.log('agrc.widgets.locate.MagicZoom::_setUpGraphicsLayer', arguments);

            var afterMapLoaded = lang.hitch(this,
                function () {
                    if (!this.graphicsLayer) {
                        this.graphicsLayer = new GraphicsLayer();
                        this.map.addLayer(this.graphicsLayer);
                    }

                    if (!this.preserveGraphics) {
                        // wire clear graphics event
                        this.map.on('extent-change', lang.hitch(this,
                            function () {
                                if (this._addingGraphic === false) {
                                    this.graphicsLayer.clear();
                                }

                                this._addingGraphic = false;
                            }
                        ));
                    }
                });

            // create new graphics layer and add to map
            if (this.map.loaded) {
                afterMapLoaded();
            } else {
                this.map.on('load', afterMapLoaded);
            }

            // set up new symbols, if needed
            if (!this.symbolFill) {
                this.symbolFill = new SimpleFillSymbol(
                    SimpleFillSymbol.STYLE_NULL,
                    new SimpleLineSymbol(
                        SimpleLineSymbol.STYLE_DASHDOT,
                        new Color([255, 255, 0]),
                        1.5),
                    null);
            }

            if (!this.symbolLine) {
                this.symbolLine = new SimpleLineSymbol()
                    .setColor(new Color([255, 255, 0]))
                    .setWidth(5);
            }

            if (!this.symbolPoint) {
                this.symbolPoint = new SimpleMarkerSymbol()
                    .setColor([255, 255, 0, 0.5])
                    .setSize(10);
            }
        },
        _wireEvents: function () {
            // summary:
            //      Wires events.
            // tags:
            //      private
            console.log('agrc.widgets.locate.MagicZoom::_wireEvents', arguments);

            this.own(
                on(this.textBox, 'keyup', lang.hitch(this, this._onTextBoxKeyUp)),
                on(this.textBox, 'blur', lang.hitch(this, function () {
                    // don't hide table if the cursor is over it
                    if (!this._isOverTable) {
                        // hide table
                        this._toggleTable(false);
                    }
                })),
                on(this.textBox, 'focus', lang.hitch(this, function () {
                    if (this.textBox.value.length > 0) {
                        this._startSearchTimer();
                    }
                })),
                on(this.matchesTable, mouse.enter, lang.hitch(this, function () {
                    // set switch
                    this._isOverTable = true;

                    // remove any rows selected using arrow keys
                    query('.highlighted-row').removeClass('highlighted-row');

                    // reset current selection
                    this._currentIndex = 0;
                })),
                on(this.matchesTable, mouse.leave, lang.hitch(this, function () {
                    // set switch
                    this._isOverTable = false;

                    // set first row as selected
                    domClass.add(this.matchesList.children[0], 'highlighted-row');
                }))
            );
        },
        _onTextBoxKeyUp: function (evt) {
            // summary:
            //      Handles the text box onKeyUp evt.
            // tags:
            //      private
            console.log('agrc.widgets.locate.MagicZoom::_onTextBoxKeyUp', arguments);

            if (evt.keyCode === keys.ENTER) {
                // zoom if there is at least one match
                if (this.matchesList.children.length > 1) {
                    this._setMatch(this.matchesList.children[this._currentIndex]);
                } else {
                    // search
                    this._search(this.textBox.value);
                }
            } else if (evt.keyCode === keys.DOWN_ARROW) {
                this._moveSelection(1);
            } else if (evt.keyCode === keys.UP_ARROW) {
                this._moveSelection(-1);
            } else {
                this._startSearchTimer();
            }
        },
        _startSearchTimer: function () {
            // summary:
            //      Sets a timer before searching so that the search function
            //      isn't called too many times.
            // tags:
            //      private
            // set timer so that it doesn't fire repeatedly during typing
            console.log('agrc.widgets.locate.MagicZoom::_startSearchTimer', arguments);

            clearTimeout(this._timer);
            this._timer = setTimeout(lang.hitch(this, function () {
                this._search(this.textBox.value);
            }), 250);
        },
        _moveSelection: function (increment) {
            // summary:
            //      Moves the selected row in the results table based upon
            //      the arrow keys being pressed.
            // increment: Number
            //      The number of rows to move. Positive moves down, negative moves up.
            // tags:
            //      private
            console.log('agrc.widgets.locate.MagicZoom::_moveSelection', arguments);

            // exit if there are no matches in table
            if (this.matchesList.children.length < 2) {
                this._startSearchTimer();
                return;
            }

            // remove selected class if any
            domClass.remove(this.matchesList.children[this._currentIndex], 'highlighted-row');

            // increment index
            this._currentIndex = this._currentIndex + increment;

            // prevent out of bounds index
            if (this._currentIndex < 0) {
                this._currentIndex = 0;
            } else if (this._currentIndex > this.matchesList.children.length - 2) {
                this._currentIndex = this.matchesList.children.length - 2;
            }

            // add selected class using new index
            domClass.add(this.matchesList.children[this._currentIndex], 'highlighted-row');
        },
        _search: function (searchString) {
            // summary:
            //      Performs a search with the QueryTask using the passed in string.
            // searchString: String
            //      The string that is used to construct the LIKE query.
            // tags:
            //      private
            console.log('agrc.widgets.locate.MagicZoom::_search', arguments);

            // return if not enough characters
            if (searchString.length < 1) {
                this._deleteAllTableRows(this.matchesTable);
                return;
            }

            // delay spinner a bit
            this._spinTimer = setTimeout(lang.hitch(this, this.showSpinner), 250);

            // execute query / canceling any previous query
            if (this._deferred) {
                this._deferred.cancel();
            }

            this._deferred = this.webApi.search(this.searchLayer, this.outFields, {
                predicate: 'UPPER(' + this.searchField + ') LIKE UPPER(\'' + searchString + '%\')',
                spatialReference: this.wkid
            }).then(lang.hitch(this, function (response) {
                // clear table
                this._deleteAllTableRows(this.matchesTable);

                this._processResults(response);
            }), lang.hitch(this, function (err) {
                this._onQueryTaskError(err);
                // clear table
                this._deleteAllTableRows(this.matchesTable);

                // swallow errors from cancels
                if (err.message !== 'undefined') {
                    throw new Error('agrc.widgets.locate.MagicZoom ArcGISServerError: ' + err.message);
                }

                this.hideSpinner();
            }));
        },
        _processResults: function (features) {
            // summary:
            //      Processes the features returned from the query task.
            // features: Object[]
            //      The features returned from the query task.
            // tags:
            //      private
            console.log('agrc.widgets.locate.MagicZoom::_processResults', arguments);

            try {
                console.info(features.length + ' search features found.');

                // remove duplicates
                features = this._sortArray(this._removeDuplicateResults(features));

                // get number of unique results
                var num = features.length;
                console.info(num + ' unique results.');

                // return if too many values or no values
                if (num > this.maxResultsToDisplay) {
                    this.showMessage('More than ' + this.maxResultsToDisplay + ' matches found...');
                    this._populateTable(features.slice(0, this.maxResultsToDisplay - 1));
                } else if (num === 0) {
                    this.showMessage('There are no matches.');
                } else {
                    this.hideMessage();

                    this._populateTable(features);
                }
            } catch (e) {
                throw new Error('agrc.widgets.locate.MagicZoom_processResults: ' + e.message);
            }

            this.hideSpinner();
        },
        _removeDuplicateResults: function (features) {
            // summary:
            //      Removes duplicates from the set of features.
            // features: Object[]
            //      The array of features that need to be processed.
            // returns: Object[]
            //      The array after it has been processed.
            // tags:
            //      private
            console.log('agrc.widgets.locate.MagicZoom::_removeDuplicateResults', arguments);

            var list = [];
            array.forEach(features, function (f) {
                if (array.some(list, function (existingF) {
                    if (existingF.attributes[this.searchField] === f.attributes[this.searchField]) {
                        if (this.contextField) {
                            if (existingF.attributes[this.contextField] === f.attributes[this.contextField]) {
                                return true;
                            }
                        } else {
                            return true; // there is a match
                        }
                    }
                }, this) === false) {
                    // add item
                    list.push(f);
                }
            }, this);

            return list;
        },
        _populateTable: function (features) {
            // summary:
            //      Populates the autocomplete table.
            // features: Object[]
            //      The array of features to populate the table with.
            // tags:
            //      private
            console.log('agrc.widgets.locate.MagicZoom::_populateTable', arguments);

            // loop through all features
            array.forEach(features, function (feat) {
                // insert new empty row
                var row = domConstruct.create('li', {
                    'class': 'match'
                }, this.msg, 'before');

                // get match value string and bold the matching letters
                var fString = feat.attributes[this.searchField];
                var sliceIndex = this.textBox.value.length;
                if (!this.contextField) {
                    row.innerHTML = fString.slice(0, sliceIndex) + fString.slice(sliceIndex).bold();
                } else {
                    // add context field values
                    var matchDiv = domConstruct.create('div', {
                        'class': 'first-cell'
                    }, row);
                    matchDiv.innerHTML = fString.slice(0, sliceIndex) + fString.slice(sliceIndex).bold();
                    var cntyDiv = domConstruct.create('div', {
                        'class': 'cnty-cell'
                    }, row);
                    cntyDiv.innerHTML = feat.attributes[this.contextField] || '';
                    domConstruct.create('div', {
                        style: 'clear: both;'
                    }, row);
                }

                // wire onclick event
                this.own(on(row, 'click', lang.hitch(this, this._onRowClick)));
            }, this);

            // select first row
            domClass.add(this.matchesList.children[0], 'highlighted-row');

            // show table
            this._toggleTable(true);
        },
        _onRowClick: function (event) {
            // summary:
            //      Handles when someone clicks on the a row in the autocomplete
            //      table.
            // event: Event
            //      The event object.
            // tags:
            //      private
            console.log('agrc.widgets.locate.MagicZoom::_onRowClick', arguments);

            this._setMatch(event.currentTarget);
        },
        _setMatch: function (row) {
            // summary:
            //      Sets the passed in row as a match in the text box and
            //      zooms to the feature.
            // row: Object
            //      The row object that you want to set the textbox to.
            // tags:
            //      private
            console.log('agrc.widgets.locate.MagicZoom::_setMatch', arguments);

            // clear any old graphics
            this.graphicsLayer.clear();

            // clear table
            this._toggleTable(false);

            // clear prompt message
            this.hideMessage();

            var predicate = '';

            // set textbox to full value
            if (!this.contextField) {
                this.textBox.value = (has('ie') < 9) ? row.innerText : row.textContent;
                predicate = this.searchField + ' = \'' + this.textBox.value + '\'';
            } else {
                // dig deeper when context values are present
                this.textBox.value = (has('ie') < 9) ? row.children[0].innerText : row.children[0].textContent;
                var contextValue = row.children[1].innerHTML;
                if (contextValue.length > 0) {
                    predicate = this.searchField + ' = \'' + this.textBox.value +
                        '\' AND ' + this.contextField + ' = \'' + contextValue + '\'';
                } else {
                    predicate = this.searchField + ' = \'' + this.textBox.value +
                        '\' AND ' + this.contextField + ' IS NULL';
                }
            }

            // execute query / canceling any previous query
            if (this._deferred) {
                this._deferred.cancel();
            }

            this._deferred = this.webApi.search(this.searchLayer, this.outFields.concat('shape@'), {
                predicate: predicate,
                spatialReference: this.wkid
            }).then(lang.hitch(this,
                    function (response) {
                        // set switch to prevent graphic from being cleared
                        this._addingGraphic = true;

                        response = array.map(response, function _convertGeometryToGraphic(geometry) {
                            return new Graphic(geometry);
                        });

                        if (response.length === 1 || response[0].geometry.type === 'polygon') {
                            this._zoom(response[0]);
                        } else {
                            this._zoomToMultipleFeatures(response);
                        }
                    }
                ), lang.hitch(this,
                    function (err) {
                        this._onQueryTaskError(err);
                        // clear table
                        this._deleteAllTableRows(this.matchesTable);

                        // swallow errors from cancels
                        if (err.message !== 'undefined') {
                            throw new Error('agrc.widgets.locate.MagicZoom ArcGISServerError: ' + err.message);
                        }

                        this.hideSpinner();
                    }
                ));
        },
        showMessage: function (msg) {
            // summary:
            //      shows a messages at the top of the matches list
            // msg: String
            console.log('agrc.widgets.locate.MagicZoom::showMessage', arguments);

            this.msg.innerHTML = msg;
            domStyle.set(this.msg, 'display', 'block');
            this._toggleTable(true);
        },
        hideMessage: function () {
            // summary:
            //      hids the message at the top of the matches list
            console.log('agrc.widgets.locate.MagicZoom::hideMessage', arguments);

            domStyle.set(this.msg, 'display', 'none');
        },
        _zoom: function (graphic) {
            // summary:
            //      Zooms to the passed in graphic.
            // graphic: esri.Graphic
            //      The esri.Graphic that you want to zoom to.
            // tags:
            //      private
            console.log('agrc.widgets.locate.MagicZoom::_zoom', arguments);

            var sym;

            // check for point feature
            if (graphic.geometry.type === 'point') {
                // zoom and center on point

                // get base layer
                var bLayer = this.map.getLayer(this.map.layerIds[0]);

                // get next to lowest lod
                var lod = bLayer.tileInfo.lods.length - this.zoomLevel;

                this.map.centerAndZoom(graphic.geometry, lod);

                sym = this.symbolPoint;
            } else {
                // zoom to feature
                this.map.setExtent(graphic.geometry.getExtent(), true);

                sym = (graphic.geometry.type === 'polyline') ? this.symbolLine : this.symbolFill;
            }
            // add graphic
            graphic.setSymbol(sym);
            this.graphicsLayer.add(graphic);

            this.onZoomed(graphic);
        },
        onZoomed: function (/*graphic*/) {
            // summary:
            //      Fires after the map has been zoomed to the graphic.
            console.log('agrc.widgets.locate.MagicZoom::onZoomed', arguments);
        },
        _deleteAllTableRows: function (table) {
            // summary:
            //      Deletes all of the rows in the table.
            // table: Object
            //      The table that you want to act upon.
            // tags:
            //      private
            console.log('agrc.widgets.locate.MagicZoom::_deleteAllTableRows', arguments);

            // delete all rows in table
            query('li.match', this.matchesTable).forEach(domConstruct.destroy);

            // hide table
            domStyle.set(table, 'display', 'none');

            // reset current index
            this._currentIndex = 0;
        },
        _toggleTable: function (show) {
            // summary:
            //      Toggles the visibility of the autocomplete table.
            // show: Boolean
            //      If true, table is shown. If false, table is hidden.
            // tags:
            //      private
            console.log('agrc.widgets.locate.MagicZoom::_toggleTable', arguments);

            var displayValue = (show) ? 'block' : 'none';
            domStyle.set(this.matchesTable, 'display', displayValue);
        },
        _sortArray: function (list) {
            // summary:
            //      Sorts the array by both the searchField and contextField
            //      if there is a contextField specied. If no context field is
            //      specified, no sorting is done since it's already done on the server
            //      with the 'ORDER BY' statement. I tried to add a second field to the
            //      'ORDER BY' statement but ArcGIS Server just choked.
            console.log('agrc.widgets.locate.MagicZoom::_sortArray', arguments);

            // custom sort function
            var that = this;

            function sortFeatures(a, b) {
                var searchField = that.searchField;
                if (a.attributes[searchField] === b.attributes[searchField]) {
                    if (a.attributes[that.contextField] < b.attributes[that.contextField]) {
                        return -1;
                    } else {
                        return 1;
                    }
                } else if (a.attributes[searchField] < b.attributes[searchField]) {
                    return -1;
                } else {
                    return 1;
                }
            }

            // sort features
            return list.sort(sortFeatures);
        },
        _zoomToMultipleFeatures: function (features) {
            // summary:
            //      Creates a multi point from features and zooms to that.
            // features: Object[]
            //      Array of features that you want to zoom to.
            // tags:
            //      private
            console.log('agrc.widgets.locate.MagicZoom::_zoomToMultipleFeatures', arguments);

            var that = this;
            var graphics = [];

            function makeMultipoint() {
                var multiPoint = new Multipoint(that.map.spatialReference);
                array.forEach(features, function (f) {
                    // add to mulipoint
                    multiPoint.addPoint(f.geometry);

                    // set symbol
                    f.setSymbol(that.symbolPoint);

                    // add to graphics layer
                    graphics.push(f);
                });
                return multiPoint.getExtent();
            }

            function unionExtents() {
                var extent;
                array.forEach(features, function (f) {
                    if (!extent) {
                        extent = f.geometry.getExtent();
                    } else {
                        extent = extent.union(f.geometry.getExtent());
                    }

                    var sym = (f.geometry.type === 'polyline') ? that.symbolLine : that.symbolFill;
                    f.setSymbol(sym);

                    graphics.push(f);
                });
                return extent;
            }

            var extent = (features[0].geometry.type === 'point') ? makeMultipoint() : unionExtents();

            this.map.setExtent(extent, true);

            array.forEach(graphics, function (g) {
                that.graphicsLayer.add(g);
            });
            console.log('this.graphicsLayer.graphics', this.graphicsLayer.graphics);
        },
        destroyRecursive: function () {
            // summary:
            //     Overridden from dijit._Widget. Removes graphics layer from map.
            console.log('agrc.widgets.locate.MagicZoom::detroyRecursive', arguments);

            if (this.graphicsLayer) {
                this.map.removeLayer(this.graphicsLayer);
            }

            this.inherited(arguments);
        }
    });
});
