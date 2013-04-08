/*global dojo, agrc, console*/
dojo.provide("agrc.modules.Formatting");
dojo.require('agrc.modules.String');
dojo.require('dojo.currency');
dojo.require('dojo.number');

agrc.modules.Formatting.FormatDate = function (params) {
    if (params !== null) {
        var myDate = new Date(params);
        return myDate.getMonth() + 1 + "/" + myDate.getDate() + "/" + myDate.getFullYear();
    }
    else {
        return null;
    }
};

agrc.modules.Formatting.FormatPhoneNumber = function(value) {
	//first remove all spaces, and special characters
	var phoneNum = dojo.string.trim(value);
	phoneNum = agrc.modules.String.ReplaceAll(phoneNum, ' ', '');
	phoneNum = agrc.modules.String.ReplaceAll(phoneNum, '(', '');
	phoneNum = agrc.modules.String.ReplaceAll(phoneNum, ')', '');
	phoneNum = agrc.modules.String.ReplaceAll(phoneNum, '-', '');
	phoneNum = agrc.modules.String.ReplaceAll(phoneNum, ',', '');
	phoneNum = agrc.modules.String.ReplaceAll(phoneNum, '.', '');
	phoneNum = agrc.modules.String.ReplaceAll(phoneNum, '/', '');
	phoneNum = agrc.modules.String.ReplaceAll(phoneNum, '\\', '');
	if(phoneNum.length === 10) {
		return '(' + phoneNum.substr(0, 3) + ') ' + phoneNum.substr(3, 3) + '-' + phoneNum.substr(6, 4);
	}
	return value;
};

//returns formatted dollar amounts for all values
agrc.modules.Formatting.USD = function(value) {
	var options = { pattern: "¤##0.00;-¤##0.00" }, parse;
	console.log("agrc.modules.Formatting.USD");
	console.log(value);
	parse = dojo.number.parse(value);
	console.log(parse);

	if(isNaN(parse)) {
		parse = 0;
	}

	console.log(dojo.number.format(parse, dojo.currency._mixInDefaults(options)));

	return dojo.number.format(parse, dojo.currency._mixInDefaults(options));
};

///Returns formatted USD amount unless value is NaN or 0 (falsey) if value is 0 since ints default to 0 if empty
///value is the $ to format
///used so databinding isn't updated on submit since nothing has changed
agrc.modules.Formatting.USDEmptyIfZero = function(value) {
	var options = {}, parse;
	console.info("agrc.modules.Formatting.USDEmptyIfZero", arguments);

	parse = dojo.number.parse(value);

	if(isNaN(parse) || !parse) {
		return value;
	}

	return dojo.number.format(parse, dojo.currency._mixInDefaults(options));
};

agrc.modules.Formatting.Round = function(value, numDecimals) {
	// summary:
	//		Round a number to the specified number of decimal places.
	// value: Number
	//		The number that you want to round.
	// numDecimals: Number
	//		The number of decimal places that you want to round to.
	// returns: Number
	//		The number that is returned.
	console.info("agrc.modules.Formatting.Round", arguments);

	var result = Math.round(value * Math.pow(10, numDecimals)) / Math.pow(10, numDecimals);
	return result;
};

agrc.modules.Formatting.AddCommas = function(value) {
	// summary:
	//		Adds thousands commas and returns the number as a string.
	// value: Number
	//		The number that you want to format
	// returns: String
	console.log(this.declaredClass + "::" + arguments.callee.nom, arguments);

	value += ''; // converts to string
	var x = value.split('.'),
	x1 = x[0],
	x2 = x.length > 1 ? '.' + x[1] : '',
	rgx = /(\d+)(\d{3})/;

	while(rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}

	return x1 + x2;
};
