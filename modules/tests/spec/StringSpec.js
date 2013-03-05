/*global describe, expect, it, agrc*/
describe("agrc.modules.StringTests", function () {
	it("ReplaceAll should replace all *'s with +'s", function () {
		expect(agrc.modules.String.ReplaceAll("***", "*", "+")).toEqual("+++");
	});

	it("ReplaceAll should preserve non replace characters", function () {
		expect(agrc.modules.String.ReplaceAll("*1*1*", "*", "")).toEqual("11");
	});

	it("RemoveWhiteSpace should remove whitespaces", function () {
		expect(agrc.modules.RemoveWhiteSpace("a b c")).toEqual("abc");
	});

	it("RemoveWhiteSpace should remove whitespaces when there are none", function () {
		expect(agrc.modules.RemoveWhiteSpace("abc")).toEqual("abc");
	});

	it("CamelCaseToSentence should make a sentence form", function () {
		expect(agrc.modules.RemoveWhiteSpace("iAmACamel")).toEqual("I am a camel");
	});

	it("CamelCaseToSentence should make a sentence form", function () {
		expect(agrc.modules.RemoveWhiteSpace("iCamel")).toEqual("I camel");
	});

	it("ToProperCase properCases correctly on all lower case words", function () {
		expect(agrc.modules.String.ToProperCase("davis county")).toEqual("Davis County");
	});

	it("ToProperCase properCases correctly on all upper case words", function () {
		expect(agrc.modules.String.ToProperCase("DAVIS COUNTY")).toEqual("Davis County");
	});

	it("ToProperCase properCases correctly on mixed case words", function () {
		expect(agrc.modules.String.ToProperCase("DAvIs CoUnTy")).toEqual("Davis County");
	});
});