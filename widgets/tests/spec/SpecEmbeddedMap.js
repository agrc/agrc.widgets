/*global afterEach, agrc, beforeEach, describe, dijit, dojo, esri, expect, it, runs, waits, waitsFor*/
describe('EmbeddedMap Widget Tests', function(){	
	it('should create a valid instance of dijit._Widget', function(){
		var underTest = new agrc.widgets.map.EmbeddedMap(null, 'test-div1');
		expect(underTest instanceof dijit._Widget).toBeTruthy();
	});
	
	it('should be able to be created more than once', function(){
		var underTest2 = new agrc.widgets.map.EmbeddedMap(null, 'test-div2');
		expect(underTest2 instanceof dijit._Widget).toBeTruthy();
	});
	
	it('should create a valid the BaseMap Widget', function(){
		var underTest = dijit.byId('test-div1');
		expect(underTest.map instanceof agrc.widgets.map.BaseMap).toBeTruthy();
	});
	
	it('should add the correct number of layers from the passed mapId to the map', function(){
		var underTest3 = new agrc.widgets.map.EmbeddedMap({mapId: 'test'}, 'test-div3');
		
		waitsFor(function(){
			return underTest3.services.length === 2;
		}, 'layers returned from layerInfo');
		
		runs(function(){
			expect(underTest3.services.length).toEqual(2);
		});
	});
	
	it('should create valid map layers', function(){
		var underTest3 = dijit.byId('test-div3');
		
		dojo.connect(underTest3.map, 'onLoad', function(){
			expect(underTest3.map.getLayer('testLayer') instanceof 
				esri.layers.ArcGISTiledMapServiceLayer).toBeTruthy();
		});
	});
});
