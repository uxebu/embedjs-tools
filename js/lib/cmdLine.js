var cmdLine = {
	
	parameters:{},
	
	config:{},
	
	setup:function(args, config){
		// summary: Call this first, to verify required params and print help, etc.
		// args: Array The parameters passed to this script.
		// config: Object The configuration of how to call the command.
		this.parameters = this._parseParameters(args);
		this.config = config;
		// Sort the parameters first by "required=true" and then by name.
		this.config.parameters.sort(function(a,b){ return a.required!=b.required ? (a.required?-1:1) : (a.name>b.name) });
		var errors = {
			missingParameters:[]
		};
		for (var i=0, l=config.parameters.length, p; i<l; i++){
			p = config.parameters[i];
			if (p.required && typeof this.parameters[p.name]=="undefined"){
				errors.missingParameters.push(p.name);
			}
		}
		
		if (this.parameters.help){
			this.printHelp();
			quit();
		}
		if (errors.missingParameters.length){
			console.error("ERROR, Missing parameter!\nThe following parameter(s) are required to run this command:\n", "  "+ errors.missingParameters.join("\n  "));
			console.error();
			this.printHelp();
			quit();
		}
	},
	
	printHelp:function(){
		var params = this.config.parameters;
		for (var i=0, l=params.length, p; i<l; i++){
			p = params[i];
			console.error("  "  + p.name + (p.required?" - This parameter is required!":""));
			console.error("    "  + p.help);
			var numExampleValues = typeof p.exampleValues=="undefined" ? 0 : p.exampleValues.length;
			console.error("    Example usages:");
			if (numExampleValues){
				for (var j=0; j<numExampleValues; j++){
					console.error("      " + p.name + "=" + p.exampleValues[j]);
				}
			} else {
				console.error("      " + p.name);
			}
		}
	},
	
	getBoolean:function(value){
		var falseValues = ["0", "false", "no", "null"];
		return falseValues.indexOf(value)!=-1 ? false : true;
	},
	
	_parseParameters:function(params){
		// summary: Take apart the params and return key-value pairs.
		var ret = {};
		for (var i=0, l=params.length, p; i<l; i++){
			p = params[i];
			var valueStart = p.indexOf("="); // Find the "="
			if (valueStart==-1){
				ret[p] = true;
			} else {
				ret[p.substr(0, valueStart)] = p.substr(valueStart+1);
			}
		}
		return ret;
	}
}
