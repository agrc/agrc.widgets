/*global dojo, agrc, console*/
dojo.provide("agrc.modules.HelperFunctions");

agrc.modules.HelperFunctions.getSelectedRadioValue = function(btnGroupName) {
	// summary:
	//		Gets the value of the selected radio button in the group.
	// btnGroupName: String
	//		The name of the radio button group
	// returns: String
	//		Returns "" if no button is selected
	console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

	function getSelectedRadio(buttonGroup) {
		// returns the array number of the selected radio button or -1 if no button is selected
		if(buttonGroup[0]) {// if the button group is an array (one button is not an array)
			for(var i = 0; i < buttonGroup.length; i++) {
				if(buttonGroup[i].checked) {
					return i;
				}
			}
		} else {
			if(buttonGroup.checked) {
				return 0;
			} // if the one button is checked, return zero
		}
		// if we get to this point, no radio button is selected
		return -1;
	}

	var buttonGroup = dojo.query("input[name=" + btnGroupName + "]");

	// returns the value of the selected radio button or "" if no button is selected
	var i = getSelectedRadio(buttonGroup);
	if(i == -1) {
		return undefined;
	} else {
		if(buttonGroup[i]) {// Make sure the button group is an array (not just one button)
			return buttonGroup[i].value;
		} else {// The button group is just the one button, and it is checked
			return buttonGroup.value;
		}
	}
};

agrc.modules.HelperFunctions.loadCss = function(href) {
	// summary:
	//		Loads a css file into the current document's head.
	// href: String
	//		The url to the css file that you want to load
	console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
	
	var head = document.getElementsByTagName("head").item(0);
	
	var link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = href;
    head.appendChild(link);
};

agrc.modules.HelperFunctions.loadJavaScript = function(src){
	// summary:
	//		Loads a JavaScript file into the current document's head.
	// src: String
	//		The url to the JavaScript file that you want to load
	console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
	
	var head = document.getElementsByTagName("head").item(0);
	
	var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = src;
    head.appendChild(script);
};