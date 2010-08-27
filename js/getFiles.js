var args = Array.prototype.slice.call(arguments);
var params = {
	jsToolsPath:"",
	buildConfigFile:"",
	platformName:"",
	profileName:"",
	debug:true,
	_help:[
		"getFiles.js jsToolsPath buildConfigFile [platformName] [profileName] [debug]",
		"    jsToolsPath - The relative path to all JavaScript tools files, where this file lies.",
		"             (if you know how we can find it out inside the script we can remove this parameter :) please provide a patch).",
		"    buildConfigFile - Where to find the build-config.json file, mostly it lays in the root of the project to build.",
		"    platformName - The platform which defines the files that belong to a certain feature, e.g. 'android'.",
		"    profileName - The profile which lists all the features, defaults to 'kitchensink'.",
		"    debug - If set debugging messages will be shown, default is false."
	]
};
function prepareParams(){
	config.loadData(args[1]);
quit();
	//params.platformName = args[2];
	//params.profileName = args[3];
	//params.debug = !!args[4];
};
params.jsToolsPath = environment["user.dir"] + "/" + args[0];
load(params.jsToolsPath + "/_global.js");
handleParams(args);

load(params.jsToolsPath + "/_getFiles.js");
//print(params.sourceDirectory+main().join(" "+params.sourceDirectory));
print(main());