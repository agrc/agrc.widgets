/*global afterEach, agrc, beforeEach, describe, dijit, dojo, esri, expect, it, runs, waits, waitsFor, spyOn*/
describe('ZoomToCoords', function(){
	var testWidget;
	beforeEach(function(){
		testWidget = dijit.byId('test-div');
	});
	
	it('should create a valid instance of dijit._Widget', function(){
		expect(testWidget instanceof dijit._Widget).toBeTruthy();
	});
	
	it('should add a graphic to the map', function(){
		testWidget.w_deg_dd.set('value', 113.8435);
		testWidget.n_deg_dd.set('value', 38.432);
		testWidget._onZoomClick();
		
		waits(1500);
		
		runs(function(){
			expect(testWidget._graphicsLayer.graphics.length).toEqual(1);
		});
	});
	
	it('should zoom the map to the correct scale', function(){
		expect(testWidget.map.getLevel()).toEqual(testWidget.zoomLevel);
	});
});