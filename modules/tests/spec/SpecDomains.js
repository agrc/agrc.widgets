require([
    'agrc/modules/Domains',
    'dojo/dom-construct',
    'dojo/Deferred',
    'dojo/request',
    'stubmodule/StubModule'
],

function (
    Domains,
    domConstruct,
    Deferred,
    request,
    StubModule
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
            it("clears out any existing options within the select", function () {
                Domains.populateSelectWithDomainValues(select);

                expect(select.children.length).toEqual(0);
            });
            it("gets the domain values", function () {
                spyOn(Domains, 'getCodedValues').andReturn(new Deferred());

                Domains.populateSelectWithDomainValues(select, fakeUrl, fieldName);

                expect(Domains.getCodedValues).toHaveBeenCalledWith(fakeUrl, fieldName);
            });
            it("returns a Deferred", function () {
                var returned = Domains.populateSelectWithDomainValues(select, fakeUrl, fieldName);

                expect(returned).toEqual(jasmine.any(Deferred));
            });
            describe('successful', function () {
                var getDef;
                var popDef;
                var codedValues;
                beforeEach(function () {
                    runs(function () {
                        getDef = new Deferred();
                        spyOn(Domains, 'getCodedValues').andReturn(getDef);
                        popDef = Domains.populateSelectWithDomainValues(select, fakeUrl, fieldName);
                        request('modules/tests/data/featureServiceResponse.json').then(
                            function (response) {
                                codedValues = JSON.parse(response).fields[3].domain.codedValues;
                                getDef.resolve(codedValues);
                            }
                        );
                    });
                    waitsFor(function () {
                        return popDef.isFulfilled();
                    }, 'popDef to be fulfilled');
                });
                it("creates the correct number of options", function () {
                    expect(select.children.length).toEqual(10);
                });
                it("populates the correct value and innerHTML", function () {
                    var option = select.children[1];

                    expect(option.value).toEqual('cr');
                    expect(option.innerHTML).toEqual('Coldwater river');
                });
                it('caches the domain values for future requests', function () {
                    expect(AGRC['agrc/modules/Domains_codedValues'][fakeUrl + '_' + fieldName])
                        .toEqual(codedValues);
                });
                it('doesnt call getCodedValues if there is an existing cache', function () {
                    AGRC['agrc/modules/Domains_codedValues'][fakeUrl + '_' + fieldName] = 
                        [{code: 'blah', name: 'blah'}];

                    Domains.populateSelectWithDomainValues(select, fakeUrl, fieldName);

                    expect(Domains.getCodedValues.callCount).toBe(1);
                });
            });
        });
        describe('getCodedValues', function () {
            var def;
            var response;
            var StubbedDomains;
            var xhrDef;
            beforeEach(function () {
                xhrDef = new Deferred();
                StubbedDomains = StubModule('agrc/modules/Domains', {
                    'dojo/request': function () {
                        return xhrDef;
                    }
                });
                def = StubbedDomains.getCodedValues(fakeUrl, fieldName);
                def.then(function (result) {
                    response = result;
                }, function (error) {
                    response = error;
                });
            });
            it("returns a dojo/Deferred object", function () {
                expect(Domains.getCodedValues(fakeUrl)).toEqual(jasmine.any(Deferred));
            });
            it("rejects the deferred with an error message if the xhr errors", function () {
                runs(function () {
                    xhrDef.reject(StubbedDomains._errMsgs.getCodedValues);
                });
                waitsFor(function () {
                    return def.isFulfilled();
                }, 'Deferred to be fulfilled');
                runs(function () {
                    expect(response).toEqual(StubbedDomains._errMsgs.getCodedValues);
                });
            });
            it("resolves the deferred with the appropriate array of values", function () {
                var requestDef;
                var jsonData;
                runs(function () {
                    requestDef = request('modules/tests/data/featureServiceResponse.json');
                    requestDef.then(function (response) {
                        jsonData = JSON.parse(response);
                        xhrDef.resolve(response);
                    });
                });
                waitsFor(function () {
                    return def.isFulfilled();
                }, 'Deferred to be fulfilled');
                runs(function () {
                    expect(response).toEqual(jsonData.fields[3].domain.codedValues);
                });
            });
        });
    });
});