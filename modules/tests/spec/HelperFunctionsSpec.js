describe("HelperFunctions", function(){
    it("should return the value of the selected radio button", function(){
        var value = agrc.modules.HelperFunctions.getSelectedRadioValue("test1");
        expect(value).toEqual('1');
    });
    it("should return undefined when there is no radio button selected", function(){
        var value = agrc.modules.HelperFunctions.getSelectedRadioValue("test2");
        expect(value).toEqual(undefined);
    });
});