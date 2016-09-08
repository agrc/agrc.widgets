define([
    './String',
    'dojo/currency',
    'dojo/number',
    'dojo/string'

],

function (
    agrcString,
    currency,
    number,
    dojoString
    ) {
    return {
        formatDate: function (params) {
            console.log('agrc/modules/Formatting:formatDate', arguments);

            if (params !== null) {
                var myDate = new Date(params);
                return myDate.getMonth() + 1 + '/' + myDate.getDate() + '/' + myDate.getFullYear();
            } else {
                return null;
            }
        },

        formatPhoneNumber: function (value) {
            console.log('agrc/modules/Formatting:formatPhoneNumber', arguments);

            //first remove all spaces, and special characters
            var phoneNum = dojoString.trim(value);
            phoneNum = agrcString.replaceAll(phoneNum, ' ', '');
            phoneNum = agrcString.replaceAll(phoneNum, '(', '');
            phoneNum = agrcString.replaceAll(phoneNum, ')', '');
            phoneNum = agrcString.replaceAll(phoneNum, '-', '');
            phoneNum = agrcString.replaceAll(phoneNum, ',', '');
            phoneNum = agrcString.replaceAll(phoneNum, '.', '');
            phoneNum = agrcString.replaceAll(phoneNum, '/', '');
            phoneNum = agrcString.replaceAll(phoneNum, '\\', '');
            if (phoneNum.length === 10) {
                return '(' + phoneNum.substr(0, 3) + ') ' + phoneNum.substr(3, 3) + '-' + phoneNum.substr(6, 4);
            }
            return value;
        },

        USD: function (value) {
            console.log('agrc/modules/Formatting:USD', arguments);

            //returns formatted dollar amounts for all values
            var options = { pattern: '¤##0.00;-¤##0.00' };
            var parse;
            parse = number.parse(value);

            if (isNaN(parse)) {
                parse = 0;
            }

            return number.format(parse, currency._mixInDefaults(options));
        },

        USDEmptyIfZero: function (value) {
            ///Returns formatted USD amount unless value is NaN or 0 (falsey)
            ///if value is 0 since ints default to 0 if empty
            ///value is the $ to format
            ///used so databinding isn't updated on submit since nothing has changed
            console.log('agrc/modules/Formatting:USDEmptyIfZero', arguments);

            var options = {};
            var parse;
            console.info('USDEmptyIfZero', arguments);

            parse = number.parse(value);

            if (isNaN(parse) || !parse) {
                return value;
            }

            return number.format(parse, currency._mixInDefaults(options));
        },

        round: function (value, numDecimals) {
            // summary:
            //      Round a number to the specified number of decimal places.
            // value: Number
            //      The number that you want to round.
            // numDecimals: Number
            //      The number of decimal places that you want to round to.
            // returns: Number
            //      The number that is returned.
            console.log('agrc/modules/Formatting:round', arguments);

            var result = Math.round(value * Math.pow(10, numDecimals)) / Math.pow(10, numDecimals);
            return result;
        },

        addCommas: function (value) {
            // summary:
            //      Adds thousands commas and returns the number as a string.
            // value: Number
            //      The number that you want to format
            // returns: String
            console.log('agrc/modules/Formatting:addCommas', arguments);

            value += ''; // converts to string
            var x = value.split('.');
            var x1 = x[0];
            var x2 = x.length > 1 ? '.' + x[1] : '';
            var rgx = /(\d+)(\d{3})/;

            while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + ',' + '$2');
            }

            return x1 + x2;
        },

        titlize: function (str) {
            // summary:
            //      Title-cases the string
            // str: String
            console.log('agrc/modules/Formatting:titlize', arguments);

            return str.toLowerCase().replace(/\b(\w)/g, function (firstLetter) {
                return firstLetter.toUpperCase();
            });
        }
    };
});
