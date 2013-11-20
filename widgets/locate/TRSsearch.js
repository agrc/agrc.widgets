define([
    'dojo/text!agrc/widgets/locate/templates/TRSsearch.html',
    'dojo/text!agrc/widgets/locate/data/townships.json',

    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',

    'dojo/dom-style',

    'dojo/io/script',

    'dojo/data/ItemFileReadStore',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',

    'dijit/form/FilteringSelect',

    'esri/geometry/Extent',


    'dijit/form/RadioButton',
    'dojox/form/BusyButton'
], function(
    template,
    townshipsTxt,

    declare,
    lang,
    array,

    domStyle,

    script,

    ItemFileReadStore,

    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,

    FilteringSelect,

    Extent
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // description:
        //      **Summary**: Allows the user to quickly zoom to a specific township, range, and optionally section.
        //      <p>
        //      **Owner(s)**: Scott Davis
        //      </p>
        //      <p>
        //      **Test Page**: <a href="/tests/dojo/agrc/1.0/agrc/widgets/tests/TRSsearchTests.html" target="_blank">
        //        agrc.widgets.map.TRSsearch.Test</a>
        //      </p>
        //      <p>
        //      **Description**:
        //      You can set the meridian, township, range and section values by using the set method and the
        //      corresponding controls with update.
        //      This widget can be used without a map.
        //      </p>
        //      <p>
        //      **Required Files**:
        //      </p>
        //      <ul><li>agrc/themes/standard/locate/TRSsearch.css</li></ul>
        // example:
        // |    var demoWidget = new agrc.widgets.locate.TRSsearch({
        // |        map: map
        // |    }, "demo-widget");

        // widgetsInTemplate: [private] Boolean
        //      Specific to dijit._Templated.
        widgetsInTemplate: true,

        templateString: template,

        // _rangeQueryUrl: [private]String
        //      The url for the web service to query for appropriate ranges based on
        //      the passed in meridian and township
        _rangeQueryUrl: '//mapserv.utah.gov/WSUT/GetFeatureAttributes.svc/trssearch-widget/layer(SGID10.CADASTRE.PLSS_TR_Lookup)returnAttributes(PairsWith)where(TorRName)(=)({0})?dojo',

        // _sectionQueryUrl: [private]String
        //      The url for the web service to query for appropriate sections based on
        //      the passed in meridian, township and range.
        _sectionQueryUrl: '//mapserv.utah.gov/WSUT/GetFeatureAttributes.svc/trssearch-widget/layer(SGID10.CADASTRE.PLSS_Sec_Lookup)returnAttributes(PairsWith)where(TRName)(=)({0})?dojo',

        // _getEnvelopeUrl: [private]String
        //      The url for the get envelope web service
        _getEnvelopeUrl: '//mapserv.utah.gov/WSUT/FeatureGeometry.svc/GetEnvelope/trssearch-widget/layer(*queryLayer*)where(LABEL)(=)(*queryString*)quotes=false',

        // _baseMeridanFld: [private]String
        //      BASEMERIDIAN field name
        _baseMeridianFld: 'BASEMERIDIAN',

        // _firstDivFld: [private]String
        _firstDivFld: 'FRSTDIVNO',

        // _sectionsFCName: [private]String
        //      The sections feature class name.
        _sectionsFCName: 'SGID10.CADASTRE.PLSSSections_GCDB',

        // _townshipsFCName: [private]String
        //      The townships feature class name.
        _townshipsFCName: 'SGID10.CADASTRE.PLSSTownships_GCDB',

        // meridian: String
        //      The currently selected meridian. (sl or ub)
        meridian: '',

        // township: String
        //      The currently selected township. (ie. 1N)
        township: '',

        // range: String
        //      The currently selected range. (ie. R1E)
        range: '',

        // section: String
        //      The currently selected section. (ie. 23)
        section: '',

        // attach points
        // _townshipDD: dijit.form.Select
        // _rangeDD: dijit.form.Select
        // _sectionDD: dijit.form.Select
        // _slRB: dijit.form.RadioButton
        // _ubRB: dijit.form.RadioButton
        // _zoomBtn: dijit.form.Button
        // _optionalMsg: <span>

        // Parameters to constructor

        // map: esri.Map
        //      A reference to the map that you want the widget associated with.
        //      If no map is provided, the zoom button is hidden.
        map: null,

        // sectionRequired: Boolean
        //      Determines whether or not the section number is required.
        //      Defaults to false.
        sectionRequired: false,

        postCreate: function() {
            // summary:
            //    Overrides method of same name in dijit._Widget.
            // tags:
            //    private
            console.log('agrc.widgets.locate.TRSsearch::postCreate', arguments);

            var store = new ItemFileReadStore({
                data: JSON.parse(townshipsTxt)
            });

            this._townshipDD.set('store', store);
            this._changeMeridian('sl');

            this._wireEvents();

            if (!this.map) {
                domStyle.set(this._zoomBtn.domNode, 'display', 'none');
            }

            if (this.sectionRequired) {
                domStyle.set(this._optionalMsg, 'display', 'none');
                this._townshipDD.set('required', true);
                this._rangeDD.set('required', true);
                this._sectionDD.set('required', true);
            }
        },

        _wireEvents: function() {
            // summary:
            //    Wires events.
            // tags:
            //    private
            console.log('agrc.widgets.locate.TRSsearch::_wireEvents', arguments);

            this.connect(this._slRB, 'onChange', function(newValue) {
                if (newValue) {
                    this._changeMeridian('sl');
                }

                this._validateForm();
            });

            this.connect(this._ubRB, 'onChange', function(newValue) {
                if (newValue) {
                    this._changeMeridian('ub');
                }

                this._validateForm();
            });

            this.connect(this._townshipDD, 'onChange', function() {
                this._onTownshipChange(this._townshipDD.get('displayedValue'));
                this._validateForm();
            });

            this.connect(this._townshipDD, 'onBlur', function() {
                this._validateForm();
            });

            this.connect(this._rangeDD, 'onChange', function() {
                this._onRangeChange(this._rangeDD.get('displayedValue'));
                this._validateForm();
            });

            this.connect(this._rangeDD, 'onBlur', function() {
                this._validateForm();
            });

            this.connect(this._sectionDD, 'onChange', function(newValue) {
                this.section = newValue;
                this._validateForm();
                this.onSectionChange(newValue);
                this.onValueChange(this._getAllValues());
            });

            this.connect(this._sectionDD, 'onBlur', function() {
                this._validateForm();
            });

            this.connect(this._zoomBtn, 'onClick', function() {
                this.zoom();
            });
        },

        _changeMeridian: function(meridian) {
            // summary:
            //      sets the available values in the township dropdown based on the meridian
            // meridian: String
            //      The id of the meridian. sl or ub
            // tags:
            //      private
            console.log('agrc.widgets.locate.TRSsearch::_changeMeridian', arguments);

            this.meridian = meridian;
            this._townshipDD.query.meridian = meridian;

            this._checkCurrentValue(this._townshipDD, {
                township: this._townshipDD.get('displayedValue'),
                meridian: meridian
            });

            this.onMeridianChange(meridian);
            this.onValueChange(this._getAllValues());
        },

        _checkCurrentValue: function(checkDD, query) {
            // summary:
            //      Checks to see if the current value of the checkDD is valid for the
            //      new value of the one above it.
            // checkDD: dijit.form.DropDown
            //      The dropdown that you want to check
            // query:
            //      The query string to use for searching for a match
            // tags:
            //      private
            console.log('agrc.widgets.locate.TRSsearch::_checkCurrentValue', arguments);

            var displayedValue = checkDD.get('displayedValue');

            if (displayedValue && displayedValue !== '') {
                checkDD.store.fetch({
                    query: query,
                    onBegin: function(total) {
                        if (total === 0) {
                            checkDD.set('displayedValue', '');
                        }
                    }
                });
            }
        },

        _updateDDStore: function(queryStr, url, dropDown) {
            // summary:
            //      Sets the available values in the dropdown based on the query
            // queryStr: String
            //      The query to place in the url
            // url: String
            //      The specific url to use
            // dropDown: dijit.form.FilteringSelect
            //      The drop down that you want to update
            // tags:
            //      private
            console.log('agrc.widgets.locate.TRSsearch::_updateDDStore', arguments);

            var that = this;
            var args = {
                url: lang.replace(url, [queryStr]),
                callbackParamName: 'callback',
                load: function(data) {
                    dropDown.set('store', that._makeStore(data));
                    that._checkCurrentValue(dropDown, {
                        value: dropDown.get('displayedValue')
                    });
                },
                error: function() {
                    console.error('There was an error retrieving ranges.');
                }
            };

            script.get(args);
        },

        _onTownshipChange: function(newTownship) {
            // summary:
            //      Fires when the user selects a new township value
            // newTownship: String
            // tags:
            //      private
            console.log('agrc.widgets.locate.TRSsearch::_onTownshipChange', arguments);

            this.township = newTownship;
            this._updateDDStore(this.meridian + 'T' + this.township, this._rangeQueryUrl, this._rangeDD);
            this.onTownshipChange(newTownship);
            this.onValueChange(this._getAllValues());
        },

        _onRangeChange: function(newRange) {
            // summary:
            //      Fires when the user changes the range value in the drop down
            // newRange: String
            //      The new range
            // tags:
            //      private
            console.log('agrc.widgets.locate.TRSsearch::_onRangeChange', arguments);

            this.range = newRange;
            this._updateDDStore(this.meridian + 'T' + this.township + 'R' + this.range, this._sectionQueryUrl, this._sectionDD);
            this.onRangeChange(newRange);
            this.onValueChange(this._getAllValues());
        },

        _makeStore: function(data) {
            // summary:
            //      Converts the data returned from the GetFeatureAttributes web service into
            //      a dojo.data.ItemFileReadStore for use with the drop downs
            // data: Object
            //      The data object returned from the web service.
            // tags:
            //      private
            console.log('agrc.widgets.locate.TRSsearch::_makeStore', arguments);

            var newData = {
                identifier: 'value',
                label: 'value',
                items: []
            };

            if (data.items[0]) {
                var values = data.items[0].Value.split('|');
                values = array.map(values, function(v) {
                    return v.replace('R', '');
                });
                this._sort(values);
                array.forEach(values, function(v) {
                    newData.items.push({
                        value: v
                    });
                });
            }

            return new ItemFileReadStore({
                data: newData
            });
        },

        _sort: function(sortArray) {
            // summary:
            //      Sorts the values from north to south or west to east.
            // tags:
            //      private
            console.log('agrc.widgets.locate.TRSsearch::_sort', arguments);

            var sortFunction = function(a, b) {
                var aDir = a.charAt(a.length - 1);
                var bDir = b.charAt(b.length - 1);

                if (aDir === 'N' || aDir === 'S' || aDir === 'E' || aDir === 'W') {
                    if (aDir === bDir) {
                        return (a.split(aDir)[0] - b.split(bDir)[0]);
                    } else {
                        if (aDir === 'N' || aDir === 'W') {
                            return -1;
                        } else {
                            return 1;
                        }
                    }
                } else {
                    return parseInt(a, 10) - parseInt(b, 10);
                }
            };

            try {
                sortArray.sort(sortFunction);
            } catch (e) {
                // swallow
            }
        },

        getFormattedTRSstring: function() {
            // summary:
            //      Formats a string from the current widget values to match
            //      this pattern: "26T1NR3WSec30"
            // returns: String | null
            //      Returns null if there is not enough data.
            console.log('agrc.widgets.locate.TRSsearch::getFormattedTRSstring', arguments);

            if (this.township === '' || this.range === '') {
                return null;
            }

            var section = (this.section !== '') ? 'Sec' + this.section : '';

            return this.getMeridianNumber() + 'T' + this.township + 'R' + this.range + section;
        },

        getMeridianNumber: function() {
            // summary:
            //      Returns the number of the selected meridian
            console.log('agrc.widgets.locate.TRSsearch::getMeridianNumber', arguments);

            return (this.meridian === 'sl') ? 26 : 30;
        },

        zoom: function() {
            // summary:
            //      Zooms to the selected section or range.
            console.log('agrc.widgets.locate.TRSsearch::zoom', arguments);

            var that = this;

            function showBusy(busy) {
                if (busy) {
                    that.map.showLoader();
                } else {
                    that.map.hideLoader();
                    that._zoomBtn.cancel();
                }
            }

            if (!this.map) {
                throw 'no map object found!';
            }

            showBusy(true);

            var url = this._getEnvelopeUrl;

            if (this.section) {
                url = url.replace('*queryLayer*', this._sectionsFCName);
            } else {
                url = url.replace('*queryLayer*', this._townshipsFCName);
            }

            url = url.replace('*queryString*', this._getStringForGetEnvelope());

            var params = {
                url: url,
                callbackParamName: 'callback',
                load: function(data) {
                    var result = data.Results[0];
                    var zoomExtent = new Extent({
                        xmin: result.MinX,
                        xmax: result.MaxX,
                        ymin: result.MinY,
                        ymax: result.MaxY,
                        spatialReference: that.map.spatialReference
                    });
                    that.map.setExtent(zoomExtent, true);
                    showBusy(false);
                },
                error: function() {
                    showBusy(false);
                }
            };

            script.get(params);
        },

        _getStringForGetEnvelope: function() {
            // summary:
            //      Formats the widget values for the get envelope web service request.
            // returns: String
            // tags:
            //      private
            console.log('agrc.widgets.locate.TRSsearch::_getStringForGetEnvelope', arguments);

            var value = "'T" + this.township + ' R' + this.range;
            if (this.section) {
                var s = (parseInt(this.section, 10) < 10) ? '0' + this.section : this.section;
                value += "' AND " + this._firstDivFld + " = '" + s;
            }

            value += "' AND " + this._baseMeridianFld + " = '" + this.getMeridianNumber() + "'";

            return value;
        },

        _validateForm: function() {
            // summary:
            //      Checks to make sure that there are enough valid values in the form
            //      to enable a successful zoom.
            //      Enables the zoom button if appropriate.
            // tags:
            //      private
            console.log('agrc.widgets.locate.TRSsearch::_validateForm', arguments);

            var value = (this.township && this.range && this._sectionDD.isValid());
            this._zoomBtn.set('disabled', !value);
        },

        _getAllValues: function() {
            // summary:
            //      Gets all of the current values for the form.
            // Returns: {meridian: String, township: String, range: String, section: String}
            console.log('agrc.widgets.locate.TRSsearch::_getAllValues', arguments);

            return {
                meridian: this.meridian,
                township: this.township,
                range: this.range,
                section: this.section
            };
        },

        // setter methods - see _WidgetBase:set
        _setMeridianAttr: function(value) {
            console.log('agrc.widgets.locate.TRSsearch::_setMeridianAttr', arguments);

            this.meridian = value;
            this['_' + value + 'RB'].set('checked', true);
            this.onMeridianChange(value);
            this.onValueChange(this._getAllValues());
        },

        _setTownshipAttr: function(value) {
            console.log('agrc.widgets.locate.TRSsearch::_setTownshipAttr', arguments);

            this.township = value;
            this._townshipDD.set('displayedValue', value);
            this.onTownshipChange(value);
            this.onValueChange(this._getAllValues());
        },

        _setRangeAttr: function(value) {
            console.log('agrc.widgets.locate.TRSsearch::_setRangeAttr', arguments);

            this.range = value;
            this._rangeDD.set('displayedValue', value);
            this.onRangeChange(value);
            this.onValueChange(this._getAllValues());
        },

        _setSectionAttr: function(value) {
            console.log('agrc.widgets.locate.TRSsearch::_setSectionAttr', arguments);

            this.section = value;
            this._sectionDD.set('displayedValue', value);
            this.onSectionChange(value);
            this.onValueChange(this._getAllValues());
        },

        // events
        onMeridianChange: function(newValue) {
            // summary:
            //      Fires whenever the meridian changes.
            // newValue: String
            //      The new value.
        },

        onTownshipChange: function(newValue) {
            // summary:
            //      Fires whenever the township changes.
            // newValue: String
            //      The new value.
        },

        onRangeChange: function(newValue) {
            // summary:
            //      Fires whenever the range changes.
            // newValue: String
            //      The new value.
        },

        onSectionChange: function(newValue) {
            // summary:
            //      Fires whenever the section changes.
            // newValue: String
            //      The new value.
        },

        onValueChange: function(newValues) {
            // summary:
            //      Fires whenever any value (meridian, township, range, or section)
            //      changes.
            // newValues: {meridian: String, township: String, range: String, section: String}
            //      An object with the updated values.
        }
    });
});