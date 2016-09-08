require([
    'agrc/modules/String'
], function (
    agrcString
) {
    describe('agrc/modules/String', function () {
        it('replaceAll should replace all *\'s with +\'s', function () {
            expect(agrcString.replaceAll('***', '*', '+')).toEqual('+++');
        });

        it('replaceAll should preserve non replace characters', function () {
            expect(agrcString.replaceAll('*1*1*', '*', '')).toEqual('11');
        });

        it('removeWhiteSpace should remove whitespaces', function () {
            expect(agrcString.removeWhiteSpace('a b c')).toEqual('abc');
        });

        it('removeWhiteSpace should remove whitespaces when there are none', function () {
            expect(agrcString.removeWhiteSpace('abc')).toEqual('abc');
        });

        // it('CamelCaseToSentence should make a sentence form', function () {
        //  expect(agrcString.removeWhiteSpace('iAmACamel')).toEqual('I am a camel');
        // });

        // it('CamelCaseToSentence should make a sentence form', function () {
        //  expect(agrcString.removeWhiteSpace('iCamel')).toEqual('I camel');
        // });

        it('toProperCase properCases correctly on all lower case words', function () {
            expect(agrcString.toProperCase('davis county')).toEqual('Davis County');
        });

        it('toProperCase properCases correctly on all upper case words', function () {
            expect(agrcString.toProperCase('DAVIS COUNTY')).toEqual('Davis County');
        });

        it('toProperCase properCases correctly on mixed case words', function () {
            expect(agrcString.toProperCase('DAvIs CoUnTy')).toEqual('Davis County');
        });
        describe('endsWith', function () {
            it('matches suffix', function () {
                expect(agrcString.endsWith('test', 'st')).toBe(true);
            });
            it('returns false if no match', function () {
                expect(agrcString.endsWith('test', 'asdf')).toBe(false);
            });
        });
    });
});
