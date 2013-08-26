require([
    'agrc/modules/JSONLoader!agrc/modules/tests/data/sampleJSON.json'

],

function (
    obj
    ) {
    describe('agrc/modules/JSONLoader', function () {
        it("returns the appropriate object", function () {
            expect(obj.prop1).toEqual('hello');
        });
    });
});