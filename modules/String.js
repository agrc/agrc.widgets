/*global dojo, agrc, console*/
dojo.provide("agrc.modules.String");

agrc.modules.String.ReplaceAll = function (inputString, searchString, replaceString) {
	console.log("agrc.modules.String.ReplaceAll");
	var stringParts = inputString.split(searchString);
	return stringParts.join(replaceString);
};

agrc.modules.String.RemoveWhiteSpace = function(inputString) {
	console.log("agrc.modules.String.RemoveWhiteSpace");
	return inputString.replace(/\s/g, '');
};

agrc.modules.String.CamelCaseToSentence = function(inputString) {
	console.log("agrc.modules.String.CamelCaseToSentence");
	return dojo.string.trim(inputString.replace(/([A-Z])/g, " $1"));
};

agrc.modules.String.ToProperCase = function(str) {
	console.log("agrc.modules.String.ToProperCase");
	// http://stackoverflow.com/questions/196972/convert-string-to-proper-case-with-javascript
	return str.replace(/\w\S*/g, function(txt) {
		return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	});
};
