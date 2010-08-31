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
	var filesWithFullPath = files.map(function(f){ return config.sourceDirectory + f });
	
	// Compress and write file in the build directory.
	var args = {
		// Very strange way of passing the params to shrinksafe, if you know it better
		// please fix it. Best would be importing the java class I guess and calling it directly in here
		// ... if I have more time ... help welcome!!!!!!
		args:[
			"-jar",
			_jsToolsPath +"/../shrinksafe.jar",
		].concat(filesWithFullPath), // Add the full path to the js files.
		output:""
	};
	runCommand("java", args);
	var buildFileNamePrefix = config.getBuildFilenamePrefix(config.profile, p);
	file.write(buildFileNamePrefix + ".js", args.output);
	
	// Create uncompressed source file, if configured to do so.
	if (config.rawData.build.generateUncompressedFiles){
		var fileName = buildFileNamePrefix + ".uncompressed.js";
		file.write(fileName, ""); // Make sure the empty file exists!
		for (var j=0, l=filesWithFullPath.length; j<l; j++){
		//for (var j=0, l=filesWithFullPath.length; j<1; j++){
			file.appendFile(filesWithFullPath[j], fileName);
		}
	}
}





//print(config.sourceDirectory + fileList.get().join(" "+config.sourceDirectory));
