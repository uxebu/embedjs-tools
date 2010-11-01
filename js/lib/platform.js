var platform = {
	// summary: This object is a collection of functions around embedjs platforms.
	//		Basically a helper object for giving all platform functions a home (namespace).
	
	// Just concat() this array to the default cmdLine parameters and you get the listed additional
	// parameters available in the command line.
	cmdLineParamsAddOn:[
		{
			name:"platforms",
			help:"A comma-separated list of platforms you want to build for, if not given the defaults are used.",
			exampleValues:["android", "ios,android,blackberry"]
		}
	],
	
	getAllValid:function(platforms, platformsDirectory){
		// summary: Find out all the valid platforms, either by the given ones of by searching the platformsDirectory
		// description: 1) Either the platforms are given as the parameter "platforms" or
		//				2) we search the platformsDirectory for all the ".json" files and
		//				use them.
		// platforms: Array?
		// 		The platforms to validate for existence.
		// returns: Array
		//		A list of all the valid platforms. Which means all the platforms that really exist and are configured,
		//		say which really have "<platform>.json" files in the according directory ("config.platformsDirectory").
		var ret = [];
		var cp = cmdLine.parameters;
		if (platforms){ // 1)
			for (var i=0, l=platforms.length, p; i<l; i++){
				p = platforms[i];
				if (file.exists(platformsDirectory + p + ".json")){
					ret.push(p);
				} else {
					console.error("Warning: Platform file '" + p + ".json' doesn't exist (should be in '" + platformsDirectory + "').");
				}
			}
		} else { // 2) 
			// Find all platform files.
// TODO Maybe make the following into a function of the file helper object!?
			importPackage(java.io); // So we can use File.
			var files = new File(platformsDirectory).list();
			for (var i=0, l=files.length, f; i<l; i++){
				f = ""+files[i]; // By default Java doesnt give us a string :( - make it one
				if (f.substr(-5)==".json"){
					ret.push(f.substr(0, f.length-5));
				}
			}
		}
		return ret;
	}
};

