require([
    'agrc/widgets/locate/TrsSearch',

    'dojo/_base/window',

    'dojo/dom-construct'
], function(
    TrsSearch,
    win,

    domConstruct
) {

    var widget, select;

    afterEach(function() {
        if (widget) {
            widget.destroy();
            widget = null;
        }
    });

    describe('agrc/widgets/locate/TrsSearch', function() {
        describe('Sanity', function() {
            beforeEach(function() {
                widget = new TrsSearch(null, domConstruct.create('div', null, win.body()));
            });

            it('should create a widget', function() {
                expect(widget).toEqual(jasmine.any(TrsSearch));
            });
        });
        describe('Init', function() {
            beforeEach(function() {
                widget = new TrsSearch(null, domConstruct.create('div', null, win.body()));
            });

            it('should initialize to the salt lake meridian', function() {
                expect(widget.get('meridian')).toEqual('SL');
            });
        });
        describe('Meridian', function() {
            beforeEach(function() {
                widget = new TrsSearch(null, domConstruct.create('div', null, win.body()));
            });

            it('should reflect the ub meridian when the corresponding button is clicked', function() {
                var evt = {
                    target: domConstruct.toDom('<button data-meridian="UB"/>')
                };

                widget._onMeridianChange(evt);
                expect(widget.get('meridian')).toEqual('UB');
            });
        });
        describe('Townships', function() {
            beforeEach(function() {
                widget = new TrsSearch(null, domConstruct.create('div', null, win.body()));
            });

            it('should return default townships in order', function() {
                var store = widget._cacheTownships(
                    [{
                        id: 1,
                        text: '19N',
                        meridian: 'SL'
                    }, {
                        id: 2,
                        text: '1N',
                        meridian: 'UB'
                    }, {
                        id: 3,
                        text: '1N',
                        meridian: 'SL'
                    }]);

                var items = widget._getTownshipsForMeridian(store, 'SL');

                expect(items.length).toEqual(2);
                expect(items[0].text).toEqual('1N');
                expect(items[1].text).toEqual('19N');
            });

            it('should change the dropdown values when the meridian changes', function() {
                spyOn(widget, '_setMeridian').and.callThrough();
                widget._cacheTownships(
                    [{
                        id: 1,
                        text: '1N',
                        meridian: 'SL'
                    }, {
                        id: 2,
                        text: '1N',
                        meridian: 'UB'
                    }, {
                        id: 3,
                        text: '2N',
                        meridian: 'SL'
                    }]);

                //this would happen from meridian butotn click
                widget.set('meridian', 'UB');

                expect(widget._setMeridian).toHaveBeenCalled();
                // code adds place holder option
                expect(widget.townshipNode.children.length).toEqual(2);
            });

            it('should do nothing if the meridian is the same', function() {
                spyOn(widget, 'onMeridianChange');
                widget.set('meridian', 'SL');

                expect(widget.onMeridianChange).not.toHaveBeenCalled();
            });
        });
        describe('Range', function() {
            beforeEach(function() {
                widget = new TrsSearch(null, domConstruct.create('div', null, win.body()));
            });

            //silly apy key wont work on :8000
            xit('should update the ranges drop down when the township is changed', function() {
                var evt = {
                    target: {
                        value: '1S'
                    }
                };

                widget._getOptionsFor('township',
                    '//api.mapserv.utah.gov/api/v1/search/' +
                    'SGID10.CADASTRE.PLSS_TR_Lookup/PairsWith?predicate=TRNAME=\'{0}\'&apikey={1}',
                    widget.rangeNode,
                    evt);

                expect(widget.rangeNode.children.length).toEqual(40);
            });
        });
        describe('Sections', function() {
            it('should default to showing sections', function() {
                widget = new TrsSearch({}, domConstruct.create('div', null, win.body()));

                expect(widget.sectionNode.parentNode.children.length).toBeGreaterThan(0);
            });

            it('should delete section node if hidden', function() {
                widget = new TrsSearch({
                    hideSection: true
                }, domConstruct.create('div', null, win.body()));

                expect(widget.sectionNode.parentNode).toEqual(null);
            });
        });
        describe('Select Change events', function() {
            xit('should reset section value if range changes', function() {
                widget = new TrsSearch({}, domConstruct.create('div', null, win.body()));
                widget.meridian = 'SL';
                widget.township = '4N';
                widget.range = '3W';
                widget.section = '1';

                widget._onRangeChange({
                    target: {
                        value: '5S'
                    }
                });

                expect(widget.get('section')).toEqual('');
            });

            it('should set the hidden value when the values change', function() {
                widget = new TrsSearch({}, domConstruct.create('div', null, win.body()));
                widget.meridian = 'SL';
                widget.township = '0S';
                widget.range = '0W';
                widget.set('section', '0');

                expect(widget.hiddenNode.value).toEqual('26T0SR0WSec0');
            });
        });
        describe('Helper functions', function() {
            beforeEach(function() {
                widget = new TrsSearch(null, domConstruct.create('div', null, win.body()));
            });
            describe('_buildSelect', function() {
                beforeEach(function() {
                    select = domConstruct.create('select', null, win.body(), 'first');
                });

                afterEach(function() {
                    domConstruct.destroy(select);
                });

                it('should add select options', function() {
                    widget._buildSelect(select, [{
                        text: 'hi'
                    }, {
                        text: 'again'
                    }]);
                    // code adds place holder option
                    expect(select.children.length).toEqual(3);
                });

                it('should clear old entries', function() {
                    widget._buildSelect(select, [{
                        text: 'hi'
                    }, {
                        text: 'again'
                    }]);
                    // code adds place holder option
                    expect(select.children.length).toEqual(3);

                    widget._buildSelect(select, [{
                        text: 'hi'
                    }]);

                    // code adds place holder option
                    expect(select.children.length).toEqual(2);
                });
            });
            describe('_formatResponse', function() {
                it('turns the response object into something build select can deal with', function() {
                    var response = {
                        'result': [{
                            'attributes': {
                                'pairswith': 'R1E|R1W|R2E|R2W|R3E|R3W|R4E|R4W|R5E|R5W|R6E|R6W|R7E|' +
                                'R8E|R9W|R10W|R11W|R12W|R13W|R14W|R15W|R16W|R17W|R18W|R19W'
                            }
                        }],
                        'status': 200
                    };

                    var items = widget._formatResponse(response);

                    expect(items.length).toEqual(25);
                    expect(items[0].text).toBeTruthy();
                    expect(items[0].text).toEqual('1W');
                    expect(items[1].text).toEqual('2W');
                });
            });
            describe('_buildTrsLabel', function() {
                it('builds a partial label', function() {
                    widget.meridian = '';
                    widget.township = '';
                    widget.range = '';
                    widget.section = '';
                    expect(widget._buildTrsLabel()).toEqual('');

                    widget.meridian = 'SL';
                    expect(widget._buildTrsLabel()).toEqual('SL');

                    widget.township = '1N';
                    expect(widget._buildTrsLabel()).toEqual('SLT1N');

                    widget.range = '1W';
                    expect(widget._buildTrsLabel()).toEqual('SLT1NR1W');

                    expect(widget._buildTrsLabel('township')).toEqual('SLT1N');
                });
            });
            describe('_buildPredicateForQuery', function() {
                it('builds a query for township range and section', function() {
                    widget.meridian = '';
                    widget.township = '';
                    widget.range = '';
                    widget.section = '';
                    expect(widget._buildPredicateForQuery()).toEqual('');

                    widget.meridian = 'SL';
                    expect(widget._buildPredicateForQuery()).toEqual('');

                    widget.township = '19S';
                    expect(widget._buildPredicateForQuery()).toEqual('');

                    widget.range = '10W';
                    expect(widget._buildPredicateForQuery()).toEqual('BASEMERIDIAN=\'26\' AND LABEL=\'T19S R10W\'');

                    widget.section = '1';
                    expect(widget._buildPredicateForQuery())
                        .toEqual('BASEMERIDIAN=\'26\' AND LABEL=\'T19S R10W\' AND SECTION=\'01\'');
                });
            });
            describe('formattedTrsString', function() {
                it('builds a query for township range and section', function() {
                    widget.meridian = '';
                    widget.township = '';
                    widget.range = '';
                    widget.section = '';
                    expect(widget.formattedTrsString()).toEqual(null);

                    widget.meridian = 'SL';
                    expect(widget.formattedTrsString()).toEqual(null);

                    widget.township = '19S';
                    expect(widget.formattedTrsString()).toEqual(null);

                    widget.range = '10W';
                    expect(widget.formattedTrsString()).toEqual('26T19SR10W');

                    widget.section = '1';
                    expect(widget.formattedTrsString()).toEqual('26T19SR10WSec1');
                });
            });
            describe('_sortFunction', function() {
                it('_sort should sort the items from north to south or from west to east', function() {
                    var testArray = [{
                        text: '1N'
                    }, {
                        text: '1S'
                    }, {
                        text: '2N'
                    }, {
                        text: '2S'
                    }];
                    var expectedArray = [{
                        text: '1N'
                    }, {
                        text: '2N'
                    }, {
                        text: '1S'
                    }, {
                        text: '2S'
                    }];

                    testArray.sort(widget._sortFunction);

                    expect(testArray).toEqual(expectedArray);

                    testArray = [{
                        text: '1E'
                    }, {
                        text: '1W'
                    }, {
                        text: '2E'
                    }, {
                        text: '2W'
                    }];
                    expectedArray = [{
                        text: '1W'
                    }, {
                        text: '2W'
                    }, {
                        text: '1E'
                    }, {
                        text: '2E'
                    }];

                    testArray.sort(widget._sortFunction);

                    expect(testArray).toEqual(expectedArray);
                });

                it('_sort should sort the section numbers correctly', function() {
                    var testArray = [{
                        text: '8'
                    }, {
                        text: '18'
                    }, {
                        text: '7'
                    }, {
                        text: '6'
                    }];
                    var expectedArray = [{
                        text: '6'
                    }, {
                        text: '7'
                    }, {
                        text: '8'
                    }, {
                        text: '18'
                    }];

                    testArray.sort(widget._sortFunction);

                    expect(testArray).toEqual(expectedArray);
                });
            });
        });
    });
});