define([
    'dojo/text!agrc/widgets/locate/templates/TRSsearch.html',

    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',

    'dojo/dom-style',
    'dojo/dom-construct',
    'dojo/dom-class',
    'dojo/dom-attr',

    'dojo/query',

    'dojo/request/script',

    'dojo/store/Memory',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',

    'esri/graphic',

    'agrc/widgets/locate/resources/townships'
], function(
    template,

    declare,
    lang,
    array,

    domStyle,
    domConstruct,
    domClass,
    domAttr,

    query,

    script,

    MemoryStore,

    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,

    Graphic,

    townships
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

        baseClass: 'agrc-trs',

        // _rangeQueryUrl: [private]String
        //      The url for the web service to query for appropriate ranges based on
        //      the passed in meridian and township

        // _sectionQueryUrl: [private]String
        //      The url for the web service to query for appropriate sections based on
        //      the passed in meridian, township and range.

        // _getEnvelopeUrl: [private]String
        //      The url for the get envelope web service

        urls: {
            range: '//api.mapserv.utah.gov/api/v1/search/SGID10.CADASTRE.PLSS_TR_Lookup/PairsWith?predicate=TorRNAME=\'{0}\'&apikey={1}',
            section: '//api.mapserv.utah.gov/api/v1/search/SGID10.CADASTRE.PLSS_Sec_Lookup/PairsWith?predicate=TRNAME=\'{0}\'&apikey={1}',
            envelope: '//api.mapserv.utah.gov/api/v1/search/{0}/shape@?predicate={1}&apikey={2}'
        },

        fields: {
            meridian: 'BASEMERIDIAN',
            section: 'SECTION'
        },

        featureClasses: {
            section: 'SGID10.CADASTRE.PLSSSections_GCDB',
            township: 'SGID10.CADASTRE.PLSSTownships_GCDB'
        },

        // meridian: String
        //      The currently selected meridian. (sl or ub)
        meridian: 'SL',

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
        // townshipNode: <select>
        // rangeNode: <select>
        // sectionNode: <select>
        // slNode: <button>
        // ubNode: <button>
        // zoomNode: <buton>

        // Parameters to constructor

        // map: esri.Map
        //      A reference to the map that you want the widget associated with.
        //      If no map is provided, the zoom button is hidden.
        map: null,

        // apiKey: string
        //      Your http://developer.mapserv.utah.gov api key
        apiKey: '',

        // hideSection: Boolean
        //      Determines whether or not the section number is used.
        //      Defaults to false.
        hideSection: false,

        // requireSection: Boolean
        //      Determines whether or not the section number is required.
        //      Defaults to false.
        requireSection: false,

        // formName: string
        //      When using this widget in a form this is the name of the hidden
        //      input for submitting the trs values.
        //      defaults to 'trs'
        formName: 'trs',

        postCreate: function() {
            // summary:
            //    Overrides method of same name in dijit._Widget.
            // tags:
            //    private
            console.log('agrc.widgets.locate.TrsSearch::postCreate', arguments);

            this._cacheTownships(townships);
            this._setMeridian(this.get('meridian'));

            if (this.hideSection) {
                domConstruct.destroy(this.sectionNode.parentNode);
            }

            if (!this.map) {
                domConstruct.destroy(this.zoomNode);
            }

            this.setupConnections();
        },
        setupConnections: function() {
            // summary:
            //      wire events, and such
            //
            console.log('agrc.widgets.locate.TrsSearc::setupConnections', arguments);

            this.connect(this.townshipNode, 'onchange', lang.hitch(this, '_onTownshipChange'));
            this.connect(this.rangeNode, 'onchange', lang.hitch(this, '_onRangeChange'));
            this.connect(this.sectionNode, 'onchange', lang.hitch(this, '_onSectionChange'));
        },
        _cacheTownships: function(townships) {
            // summary:
            //      creates the memory store of township items
            // townships: townships array
            console.log('agrc.widgets.locate.TrsSearch::_cacheTownships', arguments);

            this._townshipStore = new MemoryStore({
                data: townships
            });

            return this._townshipStore;
        },
        _getTownshipsForMeridian: function(store, meridian) {
            // summary:
            //      gets the townships specific to that meridian
            // store: dojo/store implementation
            // meridian: key value to find townships on
            console.log('agrc.widgets.locate.TrsSearch::_getTownshipsForMeridian', arguments);

            return store.query({
                meridian: meridian
            }, {
                sort: this._sortFunction
            });
        },
        _sortFunction: function(one, two) {
            // summary:
            //      sorts trs items including direction
            // a,b an object with a text property
            // console.log('agrc.widgets.locate.TrsSearch::_sortFunction', arguments);

            var a = one.text,
                b = two.text;

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
        },
        _getOptionsFor: function(prop, urlTemplate, targetNode, evt) {
            // summary:
            //      queries teh api and gets the available ranges
            // townships
            console.log('agrc.widgets.locate.TrsSearch::_getOptionsFor', arguments);

            if (evt && evt.target) {
                this.set(prop, evt.target.value);
            }

            if (this.inflight && !this.inflight.isFulfilled()) {
                this.inflight.cancel('new reqeust in action');
            }

            var url = lang.replace(urlTemplate, [this._buildTrsLabel(prop), this.apiKey]);

            this.inflight = script.get(url, {
                jsonp: 'callback'
            });

            var self = this;

            this.inflight.then(
                function(response) {
                    var items = self._formatResponse(response);
                    self._buildSelect(targetNode, items);
                },
                function(e) {
                    alert('error function', e);
                });
        },
        _formatResponse: function(response) {
            // summary:
            //      response comes back as one string. needs to be ETL'd
            // response
            console.log('agrc.widgets.locate.TrsSearch::_formatResponse', arguments);

            if (!response || response.status !== 200) {
                //error function
                return;
            }

            if (!response.result || response.result.length < 1) {
                return null;
            }

            var itemString = response.result[0].attributes.pairswith;
            var items = itemString.split('|');
            items = array.map(items, function(item) {
                return {
                    text: item.replace('R', '')
                };
            });

            items.sort(this._sortFunction);

            return items;
        },
        _buildSelect: function(node, options) {
            // summary:
            //      adds options to a select dom node
            // node: select dom node
            // options: items to be added
            console.log('agrc.widgets.locate.TrsSearch::_buildSelect', arguments);

            query('option', node).forEach(domConstruct.destroy);

            array.forEach(options, function(item) {
                var args = {
                    innerHTML: item.text
                };

                domConstruct.create('option', args, node, 'last');
            });

            this._resetLinkedSelects(node);

            var placeholder = domConstruct.toDom("<option value='' disabled selected style='display:none;'>Choose an option</option>");
            domConstruct.place(placeholder, node, 'first');
        },
        _resetLinkedSelects: function(parentNode) {
            // summary:
            //      resets the selects below the parent node
            // parentNode
            console.log('agrc.widgets.locate.TrsSearch::_resetLinkedSelects', arguments);

            var selectTree = {
                township: {
                    nodes: [this.rangeNode, this.sectionNode],
                    props: ['township', 'range', 'section']
                },
                range: {
                    nodes: [this.sectionNode],
                    props: ['range', 'section']
                },
                section: {
                    nodes: [],
                    props: ['section']
                }
            },
                container = null,
                self = this;

            if (parentNode === this.townshipNode) {
                container = selectTree.township;
            }

            if (parentNode === this.rangeNode) {
                container = selectTree.range;
            }

            if (parentNode === this.sectionNode) {
                container = selectTree.section;
            }

            if (container === null) {
                return;
            }

            array.forEach(container.nodes, function(node) {
                query('option', node).forEach(domConstruct.destroy);
            });

            array.forEach(container.props, function(prop) {
                this._set(prop, '');
                console.log('setting ' + prop + ' to empty');
            }, this);
        },
        meridianId: function() {
            // summary:
            //      Returns the number of the selected meridian
            console.log('agrc.widgets.locate.TrsSearch::meridianId', arguments);

            return (this.get('meridian') === 'SL') ? 26 : 30;
        },
        formattedTrsString: function() {
            // summary:
            //      Formats a string from the current widget values to match
            //      this pattern: "26T1NR3WSec30"
            // returns: String | null
            //      Returns null if there is not enough data.
            console.log('agrc.widgets.locate.TrsSearch::formattedTrsString', arguments);

            if (!this.get('meridian') || !this.get('township') || !this.get('range')) {
                return null;
            }

            var template = '{0}T{1}R{2}';
            if (this.get('section')) {
                template += 'Sec{3}';
            }

            return lang.replace(template, [this.meridianId(), this.get('township'), this.get('range'), this.get('section')]);
        },
        _buildTrsLabel: function(prop) {
            // summary:
            //      builds the TRS label from all the parts
            // prop: string - the depth to build the label
            console.log('agrc.widgets.locate.TrsSearch::_buildTrsLabel', arguments);

            if (!this.get('meridian')) {
                return '';
            }

            var label = this.get('meridian');

            if (!this.get('township')) {
                return label;
            }

            label += 'T' + this.get('township');

            if (!this.get('range') || prop === 'township') {
                return label;
            }

            label += 'R' + this.get('range');

            return label;
        },
        _buildPredicateForQuery: function() {
            // summary:
            //      Formats the widget values for the get envelope web service request.
            // returns: String
            // tags:
            //      private
            console.log('agrc.widgets.locate.TrsSearch::_buildPredicateForQuery', arguments);

            function pad(n, paddingLength, paddingValue) {
                paddingValue = paddingValue || '0';
                n = n + '';
                return n.length >= paddingLength ? n : new Array(paddingLength - n.length + 1).join(paddingValue) + n;
            }

            if (!this.get('meridian') || !this.get('township') || !this.get('range')) {
                return '';
            }

            var meridian = lang.replace('{0}=\'{1}\' AND ', [this.fields.meridian, this.meridianId()]);
            var townshipRange = lang.replace('LABEL=\'T{0} R{1}\'', [this.get('township'), this.get('range')]);

            if (this.get('section')) {
                var sectionNumber = pad(this.get('section'), 2, '0');
                var section = lang.replace(' AND {0}=\'{1}\'', [this.fields.section, sectionNumber]);

                return meridian + townshipRange + section;
            }

            return meridian + townshipRange;
        },

        _getAllValues: function() {
            // summary:
            //      Gets all of the current values for the form.
            // Returns: {meridian: String, township: String, range: String, section: String}
            console.log('agrc.widgets.locate.TRSsearch::_getAllValues', arguments);

            return {
                meridian: this.get('meridian'),
                township: this.get('township'),
                range: this.get('range'),
                section: this.get('section')
            };
        },
        zoom: function() {
            // summary:
            //      Zooms to the selected section or range.
            console.log('agrc.widgets.locate.TrsSearch::zoom', arguments);

            if (this.inflight && !this.inflight.isFulfilled()) {
                return;
            }

            var self = this;

            function showBusy(busy) {
                if (busy) {
                    self.map.showLoader();
                } else {
                    self.map.hideLoader();
                }
            }

            showBusy(true);

            var layer = null;

            if (this.section) {
                layer = this.featureClasses.section;
            } else {
                layer = this.featureClasses.township;
            }

            var url = lang.replace(this.urls.envelope, [layer, this._buildPredicateForQuery(), this.apiKey]);

            this.inflight = script.get(url, {
                jsonp: 'callback'
            });

            this.inflight.then(function(response) {
                    console.log(response);
                    var geometry = response.result[0];
                    var graphic = new Graphic(geometry);
                    graphic.geometry.spatialReference = self.map.spatialReference;

                    console.log(graphic);

                    self.map.setExtent(graphic.geometry.getExtent(), true);
                    console.log('setting extent');
                    showBusy(false);
                },
                function() {
                    showBusy(false);
                });
        },
        // setter methods - see _WidgetBase:set
        _setMeridian: function(meridian) {
            // summary:
            //      sets the available values in the township dropdown based on the meridian
            // meridian: String
            //      The id of the meridian. sl or ub
            // tags:
            //      private
            console.log('agrc.widgets.locate.TrsSearch::_setMeridian', arguments);

            var value = meridian || this.meridian;

            domClass.remove(this.slNode, 'btn-primary');
            domClass.remove(this.ubNode, 'btn-primary');

            if (value.toUpperCase() === 'SL') {
                domClass.add(this.slNode, 'btn-primary');

            } else {
                domClass.add(this.ubNode, 'btn-primary');
            }

            var townshipsInMeridian = this._getTownshipsForMeridian(this._townshipStore, value);

            this._buildSelect(this.townshipNode, townshipsInMeridian);
        },

        _setMeridianAttr: function(newValue) {
            console.log('agrc.widgets.locate.TrsSearch::_setMeridianAttr', arguments);

            if (newValue === this.meridian) {
                return;
            }

            this._set('meridian', newValue.toUpperCase());

            this._setMeridian(this.get('meridian'));
            this.onMeridianChange(this.get('meridian'));
            this._onValueChange(this._getAllValues());
        },
        _setTownshipAttr: function(newValue) {
            console.log('agrc.widgets.locate.TrsSearch::_setTownshipAttr', arguments);

            if (newValue === this.meridian) {
                return;
            }

            this._set('township', newValue.toUpperCase());

            this.onTownshipChange(this.get('township'));
            this._onValueChange(this._getAllValues());
        },
        _setRangeAttr: function(newValue) {
            console.log('agrc.widgets.locate.TrsSearch::_setRangeAttr', arguments);

            if (newValue === this.range) {
                return;
            }

            this._set('range', newValue.toUpperCase());

            this.onRangeChange(this.get('range'));
            this._onValueChange(this._getAllValues());
        },
        _setSectionAttr: function(newValue) {
            console.log('agrc.widgets.locate.TrsSearch::_setSectionAttr', arguments);

            if (newValue === this.section) {
                return;
            }

            this._set('section', newValue);

            this.onSectionChange(this.get('section'));
            this._onValueChange(this._getAllValues());
        },

        // events
        _onMeridianChange: function(evt) {
            // summary:
            //      handles the click event of the meridian buttons
            // evt
            console.log('agrc.widgets.locate.TrsSearch::_onMeridianChange', arguments);

            this.set('meridian', domAttr.get(evt.target, 'data-meridian'));
        },
        _onTownshipChange: function(evt) {
            // summary:
            //      Fires when the user selects a new township value
            // evt: Event
            // tags:
            //      private
            console.log('agrc.widgets.locate.TRSsearch::_onTownshipChange', arguments);

            this.set('township', evt.target.value);

            this._getOptionsFor('township', this.urls.range, this.rangeNode);
        },
        _onRangeChange: function(evt) {
            // summary:
            //      Fires when the user changes the range value in the drop down
            // evt: Event
            //      The new range
            // tags:
            //      private
            console.log('agrc.widgets.locate.TrsSearch::_onRangeChange', arguments);

            this.set('range', evt.target.value);
            this._getOptionsFor('range', this.urls.section, this.sectionNode);
        },
        _onSectionChange: function(evt) {
            // summary:
            //      Fires when the user changes the range value in the drop down
            // evt: Event
            //      The new range
            // tags:
            //      private
            console.log('agrc.widgets.locate.TrsSearch::_onSectionChange', arguments);

            this.set('section', evt.target.value);
        },
        _onValueChange: function(data) {
            // summary:
            //      sets the hidden value with the data and calls public method
            // data
            console.log('agrc.widgets.location.TrsSearch::_onValueChange', arguments);
         
            this.hiddenNode.value = this.formattedTrsString();
            this.onValueChange(data);
        },

        onMeridianChange: function(newValue) {
            // summary:
            //      Fires whenever the meridian changes.
            // newValue: String
            //      The new value.
            console.log('agrc.widgets.locate.TrsSearch::onMeridianChange', arguments);
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