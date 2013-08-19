/*global dojo, agrc, dojox*/
dojo.provide("agrc.modules.Conversions");

dojo.require('dojox.encoding.base64');

agrc.modules.Conversions.StringToByte = function (s) {
    var b = [];
    for (var i = 0; i < s.length; ++i) {
        b.push(s.charCodeAt(i));
    }

    return b;
};

agrc.modules.Conversions.ByteArrayToString = function (theByteArray) {
    var s = "";
    dojo.forEach(theByteArray, function (chr) {
        s += String.fromCharCode(chr);
    });

    return s;
};

agrc.modules.Conversions.DecodeBase64String = function (theString) {
    return dojox.encoding.base64.decode(theString);
};