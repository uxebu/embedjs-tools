var args = Array.prototype.slice.call(arguments);
var _jsToolsPath = environment["user.dir"] + "/" + args[0];
load(_jsToolsPath + "/_global.js");

// Command config
cmdLine.setup(args.slice(2), {
	parameters:defaultCmdLineParameters
});

// Handle config stuff
config.loadData(args[1]);
config.setValues(cmdLine.parameters);
//console.log('config = ', config);

load(_jsToolsPath + "/FileList.js");

// Output

// Find all platform files.
importPackage(java.io); // So we can use File.
var files = new File(config.platformsDirectory).list();
var allPlatforms = [];
for (var i=0, l=files.length, f; i<l; i++){
	f = ""+files[i]; // By default Java doesnt give us a string :( - make it one
	if (f.substr(-5)==".json"){
		allPlatforms.push(f.substr(0, f.length-5));
	}
}

for (var i=0, l=allPlatforms.length, p; i<l; i++){
	p = allPlatforms[i];
	config.setValue("platform", p);
	var files = new FileList().get(config.platformFile, config.features, config.sourceDirectory);
	var args = {
		// Very strange way of passing the params to shrinksafe, if you know it better
		// please fix it. Best would be importing the java class I guess and calling it directly in here
		// ... if I have more time ... help welcome!!!!!!
		args:[
			"-jar",
			_jsToolsPath +"/../shrinksafe.jar",
		].concat(files.map(function(f){ return config.sourceDirectory + f })), // Add the full path to the js files.
		output:""
	};
	runCommand("java", args);
	//file.write(config.getBuildFilename(config.profile, p), args.output);
console.log('config.getBuildFilename(config.profile, p) = ', config.getBuildFilename(config.profile, p));
quit();
}





//print(config.sourceDirectory + fileList.get().join(" "+config.sourceDirectory));
