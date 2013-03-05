/*global afterEach, agrc, beforeEach, describe, dijit, dojo, esri, expect, it, runs, waits, waitsFor, spyOn, console, xit*/
describe("TRSsearch", function(){
	var testWidget;
	var testMap = {
		setExtent: function(){},
		showLoader: function(){}
	};
	beforeEach(function(){
		testWidget = new agrc.widgets.locate.TRSsearch({
			map: testMap,
			'class': 'test-div'
		}).placeAt("right");
	});
	afterEach(function(){
		waits(200);
		
		runs(function(){
			testWidget.destroyRecursive();
			testWidget = null;
			console.log("destroyed");
		});
	});
	
	it('should create a valid instance of dijit._Widget', function(){
		expect(testWidget instanceof dijit._Widget).toBeTruthy();
	});
	
	it("should initialize to the salt lake meridian", function(){
		expect(testWidget.meridian).toEqual("sl");
	});
	
	it("should reflect the ub meridian when the corresponding radio button is checked", function(){
		testWidget._ubRB.set("checked", true);
		
		waits(500);
		runs(function(){
			expect(testWidget.meridian).toEqual("ub");
		});
	});
	
	it("should reflect the correct township when the dropdown is changed", function(){
		testWidget._townshipDD.set("displayedValue", "1S");
		
		waits(500);
		runs(function(){
			expect(testWidget.get("township")).toEqual("1S");
		});
	});
	
	it("_makeStore should return a valid dojo.data.ItemFileReadStore", function(){
		var testData = {
			items: [
				{
					Field: "PairsWith",
					Value: "R1E|R1W"
				}
			]
		};
		var outData = {
			identifier: "range",
			label: "range",
			items: [
				{"range":"1E"},
				{"range":"1W"}
			]
		};
		var outStore = new dojo.data.ItemFileReadStore({data: outData});
		expect(testWidget._makeStore(testData).fetch().store._arrayOfAllItems.length).toEqual(outStore.fetch().store._arrayOfAllItems.length);
	});
	
	it("should update the ranges drop down when the township is changed", function(){
		testWidget._townshipDD.set("displayedValue", "1S");
		
		waits(700);
		runs(function(){
			expect(testWidget._rangeDD.store.fetch().store._arrayOfAllItems.length).toEqual(40);
		});
	});
	
	it("should reflect the correct range when the dropdown is changed", function(){
		testWidget.set("township", "1S");
		testWidget.set("range", "1E");
		
		waits(500);
		runs(function(){
			expect(testWidget.get("range")).toEqual("1E");
		});
	});
	
	xit("should update the sections drop down when the range is changed", function(){
		testWidget.set("township", "1S");
		testWidget.set("range", "1E");
		
		waits(1500);
		runs(function(){
			expect(testWidget._sectionDD.store.fetch().store._arrayOfAllItems.length).toEqual(36);
		});
	});
	
	xit("should clear the displayed value of the range dropdown if it is not valid when the township is changed", function(){
		testWidget.set("township", "1.5S");
		testWidget.set("meridian", "ub");
		
		waits(500);
		runs(function(){
			expect(testWidget._rangeDD.get("displayedValue")).toEqual("");
		});
	});
	
	it("getFormattedTRSstring should return the appropriate format", function(){
		testWidget.set("township", "1N");
		
		expect(testWidget.getFormattedTRSstring()).toBeNull();
		
		testWidget.set("range", "1E");
		
		expect(testWidget.getFormattedTRSstring()).toEqual("26T1NR1E");
		
		testWidget.set("section", "1");
		
		expect(testWidget.getFormattedTRSstring()).toEqual("26T1NR1ESec1");
		
		testWidget.set("meridian", "ub");
		
		expect(testWidget.getFormattedTRSstring()).toEqual("30T1NR1ESec1");
	});
	
	it("_getStringForGetEnvelope should return the appropriately formatted string", function(){
		testWidget.set("township", "1N");
		testWidget.set("range", "1E");
		
		expect(testWidget._getStringForGetEnvelope()).toEqual("'T1N R1E' AND BASEMERIDIAN = '26'");
		
		testWidget.set("section", "1");
		
		expect(testWidget._getStringForGetEnvelope()).toEqual("'T1N R1E 1' AND BASEMERIDIAN = '26'");
	});
	
	it("getMeridianNumber should return the correct number", function(){
		expect(testWidget.getMeridianNumber()).toEqual(26);
		
		testWidget.set('meridian', 'ub');
		
		expect(testWidget.getMeridianNumber()).toEqual(30);
	});
	
	it("zoom should call dojo.io.script with the appropriate url parameter", function(){
		// set up
		spyOn(dojo.io.script, "get");
		
		testWidget.set("township", "1N");
		testWidget.set("range", "1E");
		
		testWidget.zoom();
		
		expect(dojo.io.script.get.mostRecentCall.args[0].url).toEqual("//mapserv.utah.gov/WSUT/FeatureGeometry.svc/GetEnvelope/trssearch-widget/layer(SGID93.CADASTRE.PLSSTownships_GCDB)where(LABEL)(=)('T1N R1E' AND BASEMERIDIAN = '26')quotes=false");
		
		testWidget.set("section", "1");
		
		testWidget.zoom();
		
		expect(dojo.io.script.get.mostRecentCall.args[0].url).toEqual("//mapserv.utah.gov/WSUT/FeatureGeometry.svc/GetEnvelope/trssearch-widget/layer(SGID93.CADASTRE.PLSSSections_GCDB)where(LABEL)(=)('T1N R1E 1' AND BASEMERIDIAN = '26')quotes=false");
	});
	
	it("_sort should sort the items from north to south or from west to east", function(){
		var testArray = ["1N", "1S", "2N", "2S"];
		var expectedArray = ["1N", "2N", "1S", "2S"];
		
		testWidget._sort(testArray);
		
		expect(testArray).toEqual(expectedArray);
		
		testArray = ["1E", "1W", "2E", "2W"];
		expectedArray = ["1W", "2W", "1E", "2E"];
		
		testWidget._sort(testArray);
		
		expect(testArray).toEqual(expectedArray);
	});
	
	it("_sort should sort the section numbers correctly", function(){
		var testArray = ["8", "18", "7", "6"];
		var expectedArray = ["6", "7", "8", "18"];
		
		testWidget._sort(testArray);
		
		expect(testArray).toEqual(expectedArray);
	});
});
