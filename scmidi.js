var loadJS = function(url, implementationCode, location){
    //url is URL of external file, implementationCode is the code
    //to be called from the file, location is the location to
    //insert the <script> element

    var scriptTag = document.createElement('script');
    scriptTag.src = url;

    scriptTag.onload = implementationCode;
    scriptTag.onreadystatechange = implementationCode;

    location.appendChild(scriptTag);
};

var initCall = function(){
	WebMidi.enable(function (err) {

		if (err) {
			console.log("WebMidi could not be enabled.", err);
		} else {
			console.log("WebMidi enabled!");
		}

	});
}

loadJS('https://cdn.jsdelivr.net/npm/webmidi', initCall, document.body);

setTimeout(function(){

	var inp = WebMidi.getInputByName("nanoKONTROL2 SLIDER/KNOB");
	var tmo = null;

	inp.addListener("controlchange","all",function(e){ 
		if(e.controller.number >=48 && e.controller.number <56) {
	 	//MUTE
	 	if(window.mode == E_MODE.MIX) window.inStrips[e.controller.number-48].mute.doClick();
	 	if(window.mode == E_MODE.AUX) window.auxSendStrips[e.controller.number-48].mute.doClick();
	 } else if(e.controller.number >=48 && e.controller.number <56) {
	 	//SOLO
	 	if(window.mode == E_MODE.MIX) window.inStrips[e.controller.number-48].solo.doClick();
	 	if(window.mode == E_MODE.AUX) window.auxSendStrips[e.controller.number-48].post.doClick();
	 }
	 else if(e.controller.number >=0 && e.controller.number <8) {
		//VOLUME
		var auxch = window.auxoutWidget.name.substr(2,1);
		var ctrlparam = "";
		if(window.mode == E_MODE.MIX) ctrlparam = "i."+e.controller.number+".mix";
		if(window.mode == E_MODE.AUX) ctrlparam = "i."+e.controller.number+".aux."+auxch+".value";
		if(window.mode == E_MODE.GAIN) ctrlparam = "i."+e.controller.number+".gain";

		if(ctrlparam == "") return;

		var diff = window.getValue(ctrlparam) - (e.value/127);
		if(diff < 0.01) window.setValue(ctrlparam, e.value/127);
		
		window.drawAll();

	} else if(e.controller.number >=16 && e.controller.number <24 && window.mode == E_MODE.MIX) {
		//PAN
		var pval = e.value/127.0;
		var cnum = e.controller.number-16;
		window.setValue("i."+cnum+".pan", pval);
		if(tmo != null) window.clearTimeout(tmo);
		tmo = window.setTimeout(function(){
			window.drawAll();
		},20)
	} else if(e.controller.number == 43) { window.setMode(E_MODE.MIX); 
	} else if(e.controller.number == 44) { window.setMode(E_MODE.AUX); 
	} else if(e.controller.number == 42) { window.setMode(E_MODE.GAIN); 
	} else if(e.controller.number == 41) { window.setMode(E_MODE.FXSENDS); 
	} else if(e.controller.number == 45) { window.setMode(E_MODE.EDIT); 	

	} else {
		console.log(e);
	}
});
},1000);
