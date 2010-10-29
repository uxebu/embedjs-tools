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
						if (typeof arg[key]=="function") continue;
						out.push(key+": "+arg[key]+"\n");
					}
				} else {
					out.push(arg);
				}
			}
			print(out.join("    "));
		},
		log:function(){
			if (!config.isVerbose) return;
			this._log.apply(this, arguments);
		},
		error:function(){
			this._log.apply(this, arguments);
		}
	}
};

var defaultCmdLineParameters = [
	{
		name:"isVerbose",
		help:"Shall debug messages be shown?",
		exampleValues:["true", "yes", "false", "no"]
	},
	{
		name:"profile",
		help:"The set of features that shall be built for.",
		exampleValues:["kitchensink", "oo-only"]
	},
	{
		name:"platform",
		help:"The platform to build for.",
		exampleValues:["android", "iphone", "nokia-wrt", "blackberry4.6"]
	},
	{
		name:"help",
		help:"Print the help for this command."
	}
];













