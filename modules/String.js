define([

], 

function (

    ) {
    return {
        replaceAll: function (inputString, searchString, replaceString) {
            console.log('agrc/modules/String::replaceAll', arguments);
            var stringParts = inputString.split(searchString);
            return stringParts.join(replaceString);
        },
        removeWhiteSpace: function(inputString) {
            console.log('agrc/modules/String::removeWhiteSpace', arguments);
            return inputString.replace(/\s/g, '');
        },
        // doesn't work
        // camelCaseToSentence: function(inputString) {
        //     console.log('agrc/modules/String::camelCaseToSentence', arguments);
        //     return dojoString.trim(inputString.replace(/([A-Z])/g, " $1"));
        // },
        toProperCase: function(str) {
            console.log('agrc/modules/String::toProperCase', arguments);
            // http://stackoverflow.com/questions/196972/convert-string-to-proper-case-with-javascript
            return str.replace(/\w\S*/g, function(txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        }
    };
});
