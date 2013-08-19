define([
        'dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/_base/Color',
        'dojo/_base/array',

        'dojo/dom-class',
        'dojo/dom-style',

        'dojo/on',
        'dojo/query',
        'dojo/keys',
        'dojo/has',

        'dijit/_WidgetBase',
        'dijit/_TemplatedMixin',
        'dijit/_WidgetsInTemplateMixin',

        'dojo/text!agrc/widgets/locate/templates/MagicZoom.html',

        'esri/tasks/query',
        'esri/tasks/QueryTask',
        'esri/layers/GraphicsLayer',
        'esri/symbols/SimpleFillSymbol',
        'esri/symbols/SimpleLineSymbol',
        'esri/symbols/SimpleMarkerSymbol',
        'esri/geometry/Multipoint',

        'dojo/_base/sniff'
    ],
    function(
        declare,
        lang,
        Color,
        array,

        domClass,
        domStyle,

        on,
        query,
        keys,
        has,

        _WidgetBase,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,

        template,

        Query,
        QueryTask,
        GraphicsLayer,
        SimpleFillSymbol,
        SimpleLineSymbol,
        SimpleMarkerSymbol,
        Multipoint
    ) {
        return declare('agrc.widgets.locate.MagicZoom', [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

            widgetsInTemplate: true,

            // templatePath: [private] String
            //      Path to template. See dijit._Templated
            templateString: template,

            // _deferred: [private] Dojo.Deferred
            //      Dojo.Deferred for canceling pending requests.   
            _deferred: null,

            // _addingGraphic: [private] Boolean
            //      switch to prevent a new graphic from being cleared
            _addingGraphic: true,

            // symbolFill: esri.symbol
            //      esri.symbol zoom graphic symbol for polygons.
            symbolFill: null,

            // symbolLine: esri.symbol
            //     esri.symbol zoom graphic symbol for polylines.
            symbolLine: null,

            // symbolPoint: esri.symbol
            //      esri.symbol zoom graphic symbol for points.
            symbolPoint: null,

            // _graphicsLayer: [private] esri.layers.GraphicsLayer
            //      esri.layers.GraphicsLayer to hold graphics.
            _graphicsLayer: null,

            // _isOverTable: Boolean
            //      A switch to help with onBlur callback on search box.
            _isOverTable: false,

            // _timer: Object
            //      A timer to delay the search so that it doesn't fire too 
            //      many times when typing quickly.
            _timer: null,

            // _currentIndex: Integer
            //      The index of the currently selected item in the results.
            _currentIndex: 0,

            // Parameters to constructor

            // map: esri.Map
            //      esri.Map reference.
            map: null,

            // promptMessage: String
            //      The label that shows up in the promptMessage for the text box.
            promptMessage: '',

            // mapServiceURL: String
            //      The URL to the map service that you want to search.
            mapServiceURL: '',

            // searchLayerIndex: Integer
            //      The index of the layer within the map service to be searched.
            searchLayerIndex: 0,

            // searchField: String
            //      The field name that is to be searched.
            searchField: '',

            // zoomLevel: Integer
            //      The number of cache levels up from the bottom that you want to zoom to.
            zoomLevel: 5,

            // maxResultsToDisplay: Integer
            //      The maximum number of results that will be displayed.
            //      If there are more, no results are displayed.
            maxResultsToDisplay: 20,

            // placeHolder: String
            //     The placeholder text in the text box
            placeHolder: 'Map Search...',

            // tooltipPosition: String
            tooltipPosition: 'before',

            // token: String
            //      Allows the widget to work with secured services
            token: null,

            // outFields: String[]
            //      The outFields parameter in the esri.tasks.Query.
            //      If set to null, then only the searchField will be added.
            outFields: null,

            constructor: function() {
                // summary:
                //      first function to fire after page loads
                console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
            },
            postCreate: function() {
                // summary:
                //      Overrides method of same name in dijit._Widget.
                // tags:
                //      private
                console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

                this._setUpQueryTask();
                this._wireEvents();
                this._setUpGraphicsLayer();

                this.inherited(arguments);
            },
            _setUpQueryTask: function() {
                // summary:
                //      Sets up the esri QueryTask.
                // tags:
                //      private
                console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

                // create new query parameter
                this.query = new Query();
                this.query.returnGeometry = false;
                this.query.outFields = this.outFields || [this.searchField];

                // create new query task
                var url = (this.token) ? this.mapServiceURL + "/" + this.searchLayerIndex + '/?token=' + this.token :
                    this.mapServiceURL + "/" + this.searchLayerIndex;
                this.queryTask = new QueryTask(url);

                // wire events
                //this.connect(this.queryTask, 'onError', this._onQueryTaskError);
            },
            _setUpGraphicsLayer: function() {
                // summary:
                //      Sets up the graphics layer and associated symbols.
                // tags:
                //      private
                console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

                var afterMapLoaded = lang.hitch(this,
                    function() {
                        this._graphicsLayer = new GraphicsLayer();
                        this.map.addLayer(this._graphicsLayer);

                        // wire clear graphics event
                        this.map.on("extent-change", lang.hitch(this,
                            function() {
                                if (this._addingGraphic === false) {
                                    this._graphicsLayer.clear();
                                }

                                this._addingGraphic = false;
                            }
                        ));
                    });

                // create new graphics layer and add to map
                if (this.map.loaded) {
                    afterMapLoaded();
                } else {
                    this.map.on('load', afterMapLoaded);
                }

                // set up new symbols
                this.symbolFill = new SimpleFillSymbol(SimpleFillSymbol.STYLE_NULL,
                    new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT,
                        new Color([255, 255, 0]), 1.5), null);

                this.symbolLine = new SimpleLineSymbol()
                    .setColor(new Color([255, 255, 0]))
                    .setWidth(5);

                this.symbolPoint = new SimpleMarkerSymbol()
                    .setColor([255, 255, 0, 0.5])
                    .setSize(10);
            },
            _wireEvents: function() {
                // summary:
                //      Wires events.
                // tags:
                //      private
                console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

                this.own(
                    on(this.textBox, 'keyup', lang.hitch(this, this._onTextBoxKeyUp)),
                    on(this.textBox, 'blur', lang.hitch(this,
                        function() {
                            // don't hide table if the cursor is over it
                            if (!this._isOverTable) {
                                // hide table
                                this._toggleTable(false);
                            }
                        })),
                    on(this.textBox, 'focus', lang.hitch(this,
                        function() {
                            this._startSearchTimer();
                        }))
                );

                this.own(
                    on(this.matchesTable, 'mouseenter', lang.hitch(this, function() {
                        // set switch
                        this._isOverTable = true;

                        // remove any rows selected using arrow keys
                        query('.selected-cell').removeClass('selected-cell');

                        // reset current selection
                        this._currentIndex = 0;
                    })),

                    on(this.matchesTable, 'mouseleave', lang.hitch(this, function() {
                        // set switch
                        this._isOverTable = false;

                        // set first row as selected
                        domClass.add(this.matchesTable.rows[0].cells[0], 'selected-cell');
                    }))
                );
            },
            _onTextBoxKeyUp: function(evt) {
                // summary:
                //      Handles the text box onKeyUp evt.
                // tags:
                //      private
                console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

                if (evt.keyCode === keys.ENTER) {
                    // zoom if there is at least one match
                    if (this.matchesTable.rows.length > 0) {
                        this._setMatch(this.matchesTable.rows[this._currentIndex]);
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
            _startSearchTimer: function() {
                // summary:
                //      Sets a timer before searching so that the search function
                //      isn't called too many times.
                // tags:
                //      private
                // set timer so that it doesn't fire repeatedly during typing
                console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

                clearTimeout(this._timer);
                this._timer = setTimeout(lang.hitch(this, function() {
                    this._search(this.textBox.value);
                }), 250);
            },
            _moveSelection: function(increment) {
                // summary:
                //      Moves the selected row in the results table based upon
                //      the arrow keys being pressed.
                // increment: Number
                //      The number of rows to move. Positive moves down, negative moves up.
                // tags:
                //      private
                console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

                // exit if there are no matches in table
                if (this.matchesTable.rows.length === 0) {
                    this._startSearchTimer();
                    return;
                }

                // remove selected class if any
                domClass.remove(this.matchesTable.rows[this._currentIndex].cells[0], 'selected-cell');

                // increment index
                this._currentIndex = this._currentIndex + increment;

                // prevent out of bounds index
                if (this._currentIndex < 0) {
                    this._currentIndex = 0;
                } else if (this._currentIndex > this.matchesTable.rows.length - 1) {
                    this._currentIndex = this.matchesTable.rows.length - 1;
                }

                // add selected class using new index
                domClass.add(this.matchesTable.rows[this._currentIndex].cells[0], 'selected-cell');
            },
            _search: function(searchString) {
                // summary:
                //      Performs a search with the QueryTask using the passed in string.
                // searchString: String
                //      The string that is used to construct the LIKE query.
                // tags:
                //      private
                console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

                // clear table
                this._deleteAllTableRows(this.matchesTable);

                // return if not enough characters
                if (searchString.length < 1) {
                    this._deleteAllTableRows(this.matchesTable);
                    //          this.textBox.displayMessage("please type at least 2 characters...");
                    return;
                }

                if (this.map.showLoader) {
                    this.map.showLoader();
                }

                // update query where clause
                this.query.where = "UPPER(" + this.searchField + ") LIKE UPPER('" + searchString + "%')";

                // execute query / canceling any previous query
                if (this._deferred) {
                    this._deferred.cancel();
                }
                this._deferred = this.queryTask.execute(this.query)
                    .then(lang.hitch(this,
                        function(featureSet) {
                            this._processResults(featureSet.features);
                        }
                    ), lang.hitch(this,
                        function(err) {
                            // swallow errors from cancels
                            if (err.message != 'undefined') {
                                throw new Error(this.declaredClass + " ArcGISServerError: " + err.message);
                            }

                            if (this.map.hideLoader) {
                                this.map.hideLoader();
                            }
                        }
                    ));
            },
            _processResults: function(features) {
                // summary:
                //      Processes the features returned from the query task.
                // features: Object[]
                //      The features returned from the query task.
                // tags:
                //      private
                console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

                try {
                    console.info(features.length + " search features found.");

                    // remove duplicates
                    features = this._removeDuplicateResults(features);

                    // get number of unique results
                    var num = features.length;
                    console.info(num + " unique results.");

                    // return if too many values or no values
                    if (num > this.maxResultsToDisplay) {
                        //this.textBox.displayMessage("More than " + this.maxResultsToDisplay + " matches found. Keep typing...");
                    } else if (num === 0) {
                        //this.textBox.displayMessage("There are no matches.");
                    } else {
                        //this.textBox.displayMessage("");

                        this._populateTable(features);
                    }
                } catch (e) {
                    throw new Error(this.declaredClass + "_processResults: " + e.message);
                }

                if (this.map.hideLoader) {
                    this.map.hideLoader();
                }
            },
            _removeDuplicateResults: function(features) {
                // summary:
                //      Removes duplicates from the set of features.
                // features: Object[]
                //      The array of features that need to be processed.
                // returns: Object[]
                //      The array after it has been processed.
                // tags:
                //      private
                console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

                var list = [];
                array.forEach(features, function(f) {
                    if (array.some(list, function(existingF) {
                        if (existingF.attributes[this.searchField] === f.attributes[this.searchField]) {
                            return true; // there is a match
                        }
                    }, this) === false) {
                        // add item
                        list.push(f);
                    }
                }, this);

                return list;
            },
            _populateTable: function(features) {
                // summary:
                //      Populates the autocomplete table.
                // features: Object[]
                //      The array of features to populate the table with.
                // tags:
                //      private
                console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

                features = this._sortArray(features);

                // loop through all features
                array.forEach(features, function(feat, i) {
                    // insert new empty row
                    var row = this.matchesTable.insertRow(i);

                    // insert match value cell
                    var matchCell = row.insertCell(0);

                    // get match value string and bold the matching letters
                    var fString = feat.attributes[this.searchField];
                    var sliceIndex = this.textBox.value.length;
                    matchCell.innerHTML = fString.slice(0, sliceIndex) + fString.slice(sliceIndex).bold();

                    // wire onclick event
                    this.own(on(row, "click", this._onRowClick));
                }, this);

                // select first row
                domClass.add(this.matchesTable.rows[0].cells[0], 'selected-cell');

                // show table
                this._toggleTable(true);

                // update message
                //this.textBox.displayMessage("Click on a result to zoom to it.");
            },
            _onRowClick: function(event) {
                // summary:
                //      Handles when someone clicks on the a row in the autocomplete
                //      table.
                // event: Event
                //      The event object.
                // tags:
                //      private
                console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

                this._setMatch(event.currentTarget);
            },
            _setMatch: function(row) {
                // summary:
                //      Sets the passed in row as a match in the text box and 
                //      zooms to the feature.
                // row: Object
                //      The row object that you want to set the textbox to.
                // tags:
                //      private
                console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

                // clear prompt message
                //this.textBox.displayMessage("");

                // clear any old graphics
                this._graphicsLayer.clear();

                // set textbox to full value
                var cell = row.cells[0];
                // textContent is the standard supported by everyone but < IE9.
                // https://developer.mozilla.org/en/DOM/Node.textContent
                this.textBox.value = (has('ie') < 9) ? cell.innerText : cell.textContent;

                // clear table
                this._toggleTable(false);

                // switch to return geometry and build where clause
                this.query.returnGeometry = true;
                this.query.where = this.searchField + " = '" + this.textBox.value + "'";
                this.queryTask.execute(this.query, lang.hitch(this, function(featureSet) {
                    // set switch to prevent graphic from being cleared
                    this._addingGraphic = true;

                    if (featureSet.features.length === 1 || featureSet.features[0].geometry.type === 'polygon') {
                        this._zoom(featureSet.features[0]);
                    } else {
                        this._zoomToMultipleFeatures(featureSet.features);
                    }
                    // set return geometry back to false
                    this.query.returnGeometry = false;
                }));
            },
            _zoom: function(graphic) {
                // summary:
                //      Zooms to the passed in graphic.
                // graphic: esri.Graphic
                //      The esri.Graphic that you want to zoom to.
                // tags:
                //      private
                console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

                var sym;

                // check for point feature
                if (graphic.geometry.type === 'point') {
                    // zoom and center on point
                    // TODO: this will not work for a map that does not have a cached service in it

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
                this._graphicsLayer.add(graphic);
            },
            _deleteAllTableRows: function(table) {
                // summary:
                //      Deletes all of the rows in the table.
                // table: Object
                //      The table that you want to act upon.
                // tags:
                //      private
                console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

                // delete all rows in table
                for (var i = table.rows.length; i > 0; i--) {
                    table.deleteRow(i - 1);
                }

                // hide table
                domStyle.set(table, "display", "none");

                // reset current index
                this._currentIndex = 0;
            },
            _toggleTable: function(show) {
                // summary:
                //      Toggles the visibility of the autocomplete table.
                // show: Boolean
                //      If true, table is shown. If false, table is hidden.
                // tags:
                //      private
                console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

                var table = (has('ie') == 7) ? 'block' : 'table';

                var displayValue = (show) ? table : 'none';
                domStyle.set(this.matchesTable, 'display', displayValue);
            },
            _sortArray: function(list) {
                console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

                // custom sort function
                var that = this;

                function sortFeatures(a, b) {
                    if (a.attributes[that.searchField] < b.attributes[that.searchField]) {
                        return -1;
                    } else {
                        return 1;
                    }
                }

                // sort features
                return list.sort(sortFeatures);
            },
            _zoomToMultipleFeatures: function(features) {
                // summary:
                //      Creates a multi point from features and zooms to that.
                // features: Object[]
                //      Array of features that you want to zoom to.
                // tags:
                //      private
                console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

                var that = this;

                function makeMultipoint() {
                    var multiPoint = new Multipoint(that.map.spatialReference);
                    array.forEach(features, function(f) {
                        // add to mulipoint
                        multiPoint.addPoint(f.geometry);

                        // set symbol
                        f.setSymbol(that.symbolPoint);

                        // add to graphics layer
                        that._graphicsLayer.add(f);
                    });
                    return multiPoint.getExtent();
                }

                function unionExtents() {
                    var extent;
                    array.forEach(features, function(f) {
                        if (!extent) {
                            extent = f.geometry.getExtent();
                        } else {
                            extent.union(f.geometry.getExtent());
                        }

                        var sym = (f.geometry.type === 'polyline') ? that.symbolLine : that.symbolFill;
                        f.setSymbol(sym);

                        that._graphicsLayer.add(f);
                    });
                    return extent;
                }

                var extent = (features[0].geometry.type === 'point') ? makeMultipoint() : unionExtents();

                this.map.setExtent(extent, true);
            },
            destroyRecursive: function() {
                // summary:
                //     Overridden from dijit._Widget. Removes graphics layer from map.
                console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

                if (this._graphicsLayer) {
                    this.map.removeLayer(this._graphicsLayer);
                }

                this.inherited(arguments);
            }
        });
    });