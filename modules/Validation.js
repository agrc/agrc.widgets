/*global dojo, agrc, console, dojox*/
dojo.provide("agrc.modules.Validation");

dojo.require('dojox.validate.us');
dojo.require('dojox.validate.web');
dojo.require('dojox.validate._base');

agrc.modules.Validation.IsValidPhoneNumber = function (value) {
    return value === "" ? true : dojox.validate.us.isPhoneNumber(value);
};

agrc.modules.Validation.IsValidEmail = function (value) {
    return value === "" ? true : dojox.validate.isEmailAddress(value);
};

agrc.modules.Validation.IsWholeNumberPercentage = function (value) {
    var flags = {
        format: [
			"#",
			"##",
			"100"
		]
    };
    return value === "" ? true : dojox.validate.isNumberFormat(value, flags);
};

agrc.modules.Validation.IsValidCircleAngle = function (value) {
    console.log("agrc.modules.Validation.IsValidCircleAngle::" + value);
    var flags = {
        format: [
			"#",
			"##",
			"360"
		]
    };
    return value === "" ? true : dojox.validate.isNumberFormat(value, flags);
};