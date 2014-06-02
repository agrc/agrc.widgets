require([
    'dojo/Deferred',

    'agrc/modules/WebAPI',

    'stubmodule'

], function(
    Deferred,

    ClassUnderTest,

    stubmodule
) {
    describe('modules/WebAPI', function() {
        var testObject;
        var apiKey = 'someKey';

        afterEach(function() {
            if (testObject) {
                if (testObject.destroy) {
                    testObject.destroy();
                }

                testObject = null;
            }
        });

        beforeEach(function() {
            testObject = new ClassUnderTest({apiKey: apiKey});
        });

        describe('Sanity', function() {
            it('should create a WebAPI', function() {
                expect(testObject).toEqual(jasmine.any(ClassUnderTest));
            });
        });

        describe('search', function () {
            var xhrDef;
            var requestSpy;
            var name;
            var rValues;
            var geo;
            var testObject2;
            var def;

            beforeEach(function (done) {
                xhrDef = new Deferred();
                requestSpy = jasmine.createSpy('requestSpy').and.returnValue(xhrDef);
                name = 'name';
                rValues = ['one', 'two'];
                geo = 'point:[x,y]';
                stubmodule('agrc/modules/WebAPI', {
                    'dojo/request': requestSpy
                }).then(function (StubbedModule) {
                    testObject2 = new StubbedModule({apiKey: apiKey});

                    done();
                });
            });
            it('makes an appropriately formatted request', function () {
                def = testObject2.search(name, rValues, {geometry: geo});
                var args = requestSpy.calls.mostRecent().args;

                // url
                expect(args[0]).toEqual(testObject2.baseUrl + 'search/' + name + '/one%2Ctwo');

                // data
                expect(args[1].query.geometry).toEqual(geo);
            });
            it('resolves with the data', function (done) {
                def = testObject2.search(name, rValues, {geometry: geo});
                var d = [];
                xhrDef.resolve({result: d, status: 200});
                def.then(function (data) {
                    expect(data).toBe(d);

                    done();
                });
            });
            it('throws errors', function (done) {
                def = testObject2.search(name, rValues, {geometry: geo});
                var e = 'error!';
                xhrDef.resolve({
                    status: 'not 200',
                    message: e
                });
                def.then(function () {}, function (err) {
                    expect(err).toEqual(e);
                    done();
                });
            });
            it('adds the apiKey', function () {
                // no options
                def = testObject2.search(name, rValues);

                expect(requestSpy.calls.mostRecent().args[1].query.apiKey).toEqual(apiKey);

                // with options
                def = testObject2.search(name, rValues, {});

                expect(requestSpy.calls.mostRecent().args[1].query.apiKey).toEqual(apiKey);
            });
            it('sets a default for attributeStyle', function () {
                // default
                def = testObject2.search(name, rValues, {geometry: geo});

                expect(requestSpy.calls.mostRecent().args[1].query.attributeStyle)
                    .toEqual(testObject2.defaultAttributeStyle);

                // explicit
                var value = 'blah';
                def = testObject2.search(name, rValues, {
                    geometry: geo,
                    attributeStyle: value
                });

                expect(requestSpy.calls.mostRecent().args[1].query.attributeStyle)
                    .toEqual(value);
            });
            it('encodes the url to take care of the "@" symbol', function () {
                def = testObject2.search(name, ['shape@envelope'], {geometry: geo});
                var args = requestSpy.calls.mostRecent().args;

                // url
                expect(args[0]).toEqual(testObject2.baseUrl + 'search/' + name + '/shape%40envelope');
            });
        });
    });
});