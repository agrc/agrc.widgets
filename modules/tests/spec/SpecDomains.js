require([
    'agrc/modules/Domains',

    'dojo/Deferred',
    'dojo/promise/Promise',
    'dojo/dom-construct',
    'dojo/text!modules/tests/data/featureServiceResponse.json',

    'stubmodule'
], function (
    Domains,

    Deferred,
    Promise,
    domConstruct,
    featureServiceResponseTxt,

    stubModule
) {
    describe('agrc/modules/Domains', function () {
        var select;
        var fakeUrl = 'blah';
        var fieldName = 'STREAM_TYPE';

        beforeEach(function () {
            select = domConstruct.create('select');
            domConstruct.create('option', {}, select);
            domConstruct.create('option', {}, select);
        });
        afterEach(function () {
            if (window.AGRC) {
                window.AGRC['agrc/modules/Domains_codedValues'] = null;
            }
        });
        it('returns an object', function () {
            expect(Domains).toEqual(jasmine.any(Object));
        });
        describe('populateSelectWithDomainValues', function () {
            it('clears out any existing options within the select', function () {
                Domains.populateSelectWithDomainValues(select);

                expect(select.children.length).toEqual(0);
            });
            it('gets the domain values', function () {
                spyOn(Domains, 'getCodedValues').and.returnValue(new Deferred());

                Domains.populateSelectWithDomainValues(select, fakeUrl, fieldName);

                expect(Domains.getCodedValues).toHaveBeenCalledWith(fakeUrl, fieldName);
            });
            it('returns a Deferred', function () {
                var returned = Domains.populateSelectWithDomainValues(select, fakeUrl, fieldName);

                expect(returned).toEqual(jasmine.any(Deferred));
            });
            describe('successful', function () {
                var getDef;
                var codedValues;
                beforeEach(function () {
                    getDef = new Deferred();
                    spyOn(Domains, 'getCodedValues').and.returnValue(getDef);
                    Domains.populateSelectWithDomainValues(select, fakeUrl, fieldName);
                    codedValues = JSON.parse(featureServiceResponseTxt).fields[3].domain.codedValues;
                    getDef.resolve(codedValues);
                });
                it('creates the correct number of options', function () {
                    expect(select.children.length).toEqual(10);
                });
                it('populates the correct value and innerHTML', function () {
                    var option = select.children[1];

                    expect(option.value).toEqual('cr');
                    expect(option.innerHTML).toEqual('Coldwater river');
                });
                it('caches the domain values for future requests', function () {
                    expect(window.AGRC['agrc/modules/Domains_codedValues'][fakeUrl + '_' + fieldName])
                        .toEqual(codedValues);
                });
                it('doesnt call getCodedValues if there is an existing cache', function () {
                    window.AGRC['agrc/modules/Domains_codedValues'][fakeUrl + '_' + fieldName] =
                        [{code: 'blah', name: 'blah'}];

                    Domains.populateSelectWithDomainValues(select, fakeUrl, fieldName);

                    expect(Domains.getCodedValues.calls.count()).toBe(1);
                });
            });
        });
        describe('getCodedValues', function () {
            var def;
            var response;
            var StubbedDomains;
            var xhrDef;
            beforeEach(function (done) {
                xhrDef = new Deferred();
                stubModule('agrc/modules/Domains', {
                    'dojo/request': function () {
                        return xhrDef;
                    }
                }).then(function (Stubbed) {
                    StubbedDomains = Stubbed;
                    def = StubbedDomains.getCodedValues(fakeUrl, fieldName);
                    def.then(function (result) {
                        response = result;
                    }, function (error) {
                        response = error;
                    });
                    done();
                });
            });
            it('returns a dojo/Deferred object', function () {
                expect(Domains.getCodedValues(fakeUrl)).toEqual(jasmine.any(Promise));
            });
            it('rejects the deferred with an error message if the xhr errors', function () {
                xhrDef.reject(StubbedDomains._errMsgs.getCodedValues);

                expect(response).toEqual(StubbedDomains._errMsgs.getCodedValues);
            });
            it('resolves the deferred with the appropriate array of values', function (done) {
                var jsonData;
                jsonData = JSON.parse(featureServiceResponseTxt);
                xhrDef.resolve(featureServiceResponseTxt);
                xhrDef.then(function () {
                    expect(response).toEqual(jsonData.fields[3].domain.codedValues);
                    done();
                });
            });
        });
    });
});
