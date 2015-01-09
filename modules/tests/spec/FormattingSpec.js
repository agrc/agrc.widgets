require([
    'agrc/modules/Formatting'

],

function (
    Formatting
    ) {
    describe('Formatting Module', function(){
        describe('round', function(){
            it('should round 4 decimal places down to 2', function(){
                expect(Formatting.round(4.1234, 2)).toEqual(4.12);
            });
            
            it('should round 1 decimal places up to 2', function(){
                expect(Formatting.round(4.1, 2)).toEqual(4.10);
            });
        });
        describe('addCommas', function(){
            it('should add commas', function(){
                expect(Formatting.addCommas(1000)).toEqual('1,000');
                expect(Formatting.addCommas(1000000)).toEqual('1,000,000');
                expect(Formatting.addCommas(1234.123)).toEqual('1,234.123');
                expect(Formatting.addCommas(-1000000)).toEqual('-1,000,000');
            });
        });
        describe('formatPhoneNumber', function () {
            it('formats a string as a phone number', function () {
                expect(Formatting.formatPhoneNumber(' 8011234567')).toEqual('(801) 123-4567');
            });
        });
        describe('titlize', function () {
            it('capitalizes the first letter or each word in a string', function () {
                expect(Formatting.titlize('SALT LAKE')).toEqual('Salt Lake');
                expect(Formatting.titlize('ONEWORD')).toEqual('Oneword');
                expect(Formatting.titlize('lower case words')).toEqual('Lower Case Words');
                expect(Formatting.titlize('word with 34 numbers')).toEqual('Word With 34 Numbers');
            });
        });
    });
});