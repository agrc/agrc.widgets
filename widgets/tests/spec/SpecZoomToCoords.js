require([
    'agrc/widgets/locate/ZoomToCoords',

    'dojo/_base/window',

    'dojo/dom-construct',
    'dojo/dom-style',
    'dojo/dom-class',

    'dojo/query'
], function(
    WidgetUnderTest,

    win,

    domConstruct,
    domStyle,
    domClass,

    query
) {

    var widget;

    afterEach(function() {
        if (widget) {
            widget.destroy();
            widget = null;
        }
    });

    describe('agrc/widgets/locate/ZoomToCoords', function() {
        describe('Sanity', function() {
            beforeEach(function() {
                widget = new WidgetUnderTest({
                    map: {
                        centerAndZoom: function() {

                        }
                    }
                }, domConstruct.create('div', null, win.body()));
            });

            it('should create a ZoomToCoords', function() {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });
        describe('_updateView', function() {
            beforeEach(function() {
                widget = new WidgetUnderTest({
                    map: {
                        centerAndZoom: function() {

                        }
                    }
                }, domConstruct.create('div', null, win.body()));
            });
            it('should hide everything except utm on load', function() {
                var nodes = query('.show', widget.domNode);

                expect(nodes.length).toEqual(1);

                var node = nodes[0];

                expect(node).toBe(widget._panelController.visible);
                expect(node).toBe(widget.utmNode);
            });
            it('should hide everything except what is chosen', function() {
                var evt = {
                    target: {
                        value: 'dd'
                    }
                };

                widget._updateView(evt);

                var nodes = query('.show', widget.domNode);

                expect(nodes.length).toEqual(1);

                var node = nodes[0];

                expect(node).toBe(widget._panelController.visible);
                expect(node).toBe(widget.ddNode);
            });
        });
        describe('_validate', function() {
            beforeEach(function() {
                widget = new WidgetUnderTest({
                    map: {
                        centerAndZoom: function() {

                        }
                    }
                }, domConstruct.create('div', null, win.body()));
            });
            it('returns false if inputs are empty', function() {
                expect(widget._validate()).toEqual(false);
            });
            it('returns false if inputs contain any non numbers', function() {
                var nodes = query('input[type="text"]', widget.utmNode);

                nodes[0].value = 'not a number 1';
                nodes[1].value = '1';

                expect(nodes.length).toEqual(2);

                expect(widget._validate()).toEqual(false);
            });
            it('returns true if inputs are all numbers', function() {
                var nodes = query('input[type="text"]', widget.utmNode);

                nodes[0].value = '15.00';
                nodes[1].value = '1.234';

                expect(nodes.length).toEqual(2);

                expect(widget._validate()).toEqual(true);
            });
        });
        describe('zoom', function () {
            beforeEach(function() {
                widget = new WidgetUnderTest({
                    map: {
                        centerAndZoom: function() {},
                        spatialReference: {}
                    }
                }, domConstruct.create('div', null, win.body()));
            });
            it('does not call projection service if wkids match', function () {
                spyOn(widget, '_getPoint').and.callFake(function(){
                    return {
                        spatialReference:{
                            wkid: 0
                        }
                    };
                });
                spyOn(widget._geometryService, 'project');

                widget.map.spatialReference.wkid = 0;

                widget.zoom();

                expect(widget._geometryService.project).not.toHaveBeenCalled();
            });
            it('reprojects point if wkids do not match', function () {
                spyOn(widget, '_getPoint').and.callFake(function(){
                    return {
                        spatialReference:{
                            wkid: 1
                        }
                    };
                });
                spyOn(widget._geometryService, 'project');

                widget.map.spatialReference.wkid = 0;

                widget.zoom();

                expect(widget._geometryService.project).toHaveBeenCalled();
            });
        });
    });
});