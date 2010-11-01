var config = {
	// summary: The config object, which contains all the config data and logic.
	
	// This is the config data as we read it from the config file
	// of the project we are just building.
	rawData:null,
	
	// Shall debug messages be shown?
	isVerbose:false,
	
	// The directory where the "build-config.json" lies
	// all paths in rawData are relative to this directory.
	rootDirectory:"",
	
	// The profile we use, e.g. "kitchensink".
	profile:"",
	
	// The list of features, just some strings that are needed to resolve the deps.
	features:[],
	
	platformsDirectory:"",
	platformFile:"",
	
	sourceDirectory:"",
	
	testsDirectory:"",

	loadData:function(file){
		this.rawData = util._loadJsonFile(file);
		// We rely on the directory to use "/"!!! may fail on windows!
		this.rootDirectory = file.split("/").slice(0, -1).join("/");
	},
	
	setValues:function(params){
		var d = this.rawData;
		var defaults = d.defaults;
// TODO the following line should not depend on cmdLine I think it is even obsolete, double check and fix please!!!!
		this.isVerbose = typeof params.isVerbose=="undefined" ? d.isVerbose : cmdLine.getBoolean(params.isVerbose);
		this.profile = params.profile || defaults.profile;
		this.features = d.profiles[this.profile];
		this.setValue("platform", params.platform || defaults.platform);
		this.sourceDirectory = util.endInSlash(this.rootDirectory + "/" + d.paths.source);
		this.buildDirectory = util.endInSlash(this.rootDirectory + "/" + d.paths.build);
		this.testsDirectory = util.endInSlash(this.rootDirectory + "/" + d.paths.tests);
	},
	
	setValue:function(key, value){
		var d = this.rawData;
		if (key=="platform"){
			this.platformsDirectory = util.endInSlash(this.rootDirectory + "/" + d.paths.platforms);
			this.platformFile = this.platformsDirectory + value + ".json";
		}
	},
	
	getBuildFilenamePrefix:function(profile, platform){
		var ret = this.rawData.build.fileName;
		// Replace ${PROFILE} and ${PLATFORM}.
		ret = ret.replace("${PROFILE}", profile).replace("${PLATFORM}", platform);
		ret = this.buildDirectory + ret;
		return ret;
	},
};
