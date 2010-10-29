// Our mini dojo ... API compatible for the features we use :)
// Would like to build this set as we need it down here using embedJS some day ... will be possible, just needs the time to do it :)
globalNamespace = this;
var dojo = {
	hitch:function(scope, method){
		return function(){ return scope[method].apply(scope, arguments || []); };
	},
	declare:function(name, parent, klass){
		globalNamespace[name] = klass["constructor"] || function(){};
		var ref = globalNamespace[name];
		for (var prop in klass){
			if (prop=="constructor") continue;
			ref.prototype[prop] = klass[prop];
		}
	},
};

