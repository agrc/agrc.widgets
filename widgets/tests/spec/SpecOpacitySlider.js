/*global afterEach, agrc, beforeEach, describe, dijit, dojo, esri, expect, it, runs, waits, waitsFor, spyOn*/
describe('OpacitySlider Tests', function(){
	var testWidget;
	beforeEach(function(){
		testWidget = dijit.byId('test-div');
	});
	
	it('should create a valid instance of dijit._Widget', function(){
		expect(testWidget instanceof dijit._Widget).toBeTruthy();
	});
	
	it('should set the slider to the initial opacity of the passed in layer', function(){
		expect(testWidget.slider.value).toEqual(0.5);
	});
	
	it('should set the layer and legend opacities to the slider value when changed', function(){
		var newValue = 0.75;
		testWidget.slider.set('value', newValue);
		
		waits(500); // to let the map service catch up
		
		runs(function(){
			expect(testWidget.mapServiceLayer.opacity).toEqual(newValue);
			if (!dojo.isIE){
				newValue = newValue + '';
			}
			expect(dojo.style(testWidget.legend, 'opacity')).toEqual(newValue);
		});
	});
});
