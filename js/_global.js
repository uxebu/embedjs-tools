//
//	Make console.log work when debug is turned on.
//	Implement console.error
//
if (typeof console=="undefined"){
	var console = {
		_log:function(){
			var out = [];
			for (var i=0, l=arguments.length, arg; i<l; i++){
				arg = arguments[i];
				if (arg && typeof arg["length"]!="undefined"){
					out.push(""+arg);
				} else if (typeof arg=="object"){
					for (var key in arg){
						out.push(key+": "+arg[key]+"\n");
					}
				} else {
					out.push(arg);
				}
			}
			print(out.join("    "));
		},
		log:function(){
			if (!params.debug) return;
			this._log.apply(this, arguments);
		},
		error:function(){
			this._log.apply(this, arguments);
		}
	}
};

function handleParams(args){
	function showHelpText(){
		print(params._help.join("\n"));
		quit();
	};
	if (args.length<2){
		showHelpText();
	} else {
		prepareParams();
	}
};

function endInSlash(path){
	return path.substr(-1)!="/" ? path+"/" : path;
};

function _loadJsonFile(fileName, throwError){
	var ret = null;
	try{
		eval("ret = "+readFile(fileName));
	}catch(e){
		if (typeof throwError=="undefined" || throwError!=false){
			console.error("ERROR: reading file '" + fileName + "' at line "+ e.lineNumber);
			for (var key in e){ if (typeof e[key]!="function") console.error(key, ((""+e[key]).length>100 ? e[key].substr(0, 100)+"..." : e[key])) }
		}
	}
	return ret;
};

function _loadTextFile(fileName, throwError){
	var ret = null;
	try{
		ret = readFile(fileName);
	}catch(e){
		if (typeof throwError=="undefined" || throwError!=false){
			console.error("ERROR: reading file '" + fileName);
			for (var key in e){ if (typeof e[key]!="function") console.error(key, ((""+e[key]).length>100 ? e[key].substr(0, 100)+"..." : e[key])) }
		}
	}
	return ret;
};


var cmdLine = {
	parseParams:function(params){
		// summary: Take apart the params and return key-value pairs.
		var ret = {};
		for (var i=0, l=params.length, p; i<l; i++){
			p = params[i];
			var valueStart = p.indexOf("="); // Find the "="
			ret[p.substr(0, valueStart)] = p.substr(valueStart+1);
		}
		return ret;
	}
}


var config = {
	// summary: The config object, which contains all the config data and logic.
	
	// This is the config data as we read it from the config file
	// of the project we are just building.
	_rawData:null,

	loadData:function(file){
		this._rawData = _loadJsonFile(file);
	},
	
	setValues:function(params){
		
	},
	
}