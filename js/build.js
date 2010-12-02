var args = Array.prototype.slice.call(arguments);
// check if we got a relative or absolute path
var _jsToolsPath = args[0][0] == '/' ? args[0] : environment["user.dir"] + "/" + args[0];
load(_jsToolsPath + "/lib/_global.js");
load(_jsToolsPath + "/lib/util.js");
load(_jsToolsPath + "/lib/dojo.js");
load(_jsToolsPath + "/lib/cmdLine.js");
load(_jsToolsPath + "/lib/config.js");
load(_jsToolsPath + "/lib/file.js");
load(_jsToolsPath + "/lib/platform.js");

load(_jsToolsPath + "/lib/buildUtil.js");
load(_jsToolsPath + "/lib/fileUtil.js");


// Command config
cmdLine.setup(args.slice(2), {
	parameters:
		defaultCmdLineParameters
		.concat(platform.cmdLineParamsAddOn) // Add the params normally used when working on platforms stuff.
		.concat(
			[
				{
					name:"uncompressed",
					help:"Shall the uncompressed files be generated too? This overrides the value from the config file.",
					exampleValues:["true", "yes", "false", "no"]
				}
			]
		)
	}
);

// Handle config stuff
config.loadData(args[1]);
config.setValues(cmdLine.parameters);

load(_jsToolsPath + "/lib/FileList.js");

// Let's merge the "platform" param if used into "platforms".
// Validate the platforms given and keep working with the clean list.
var allValidPlatforms = platform.getAllValid(config.platformsDirectory, cmdLine.mergeParams("platforms", "platform"));


//
//	Go through all the platforms and create the build.
//	That means run the set of files through a compressor and
//	create the uncompressed files, using some simple java stuff, if configured so.
//
var uncompressed = typeof cmdLine.parameters.uncompressed=="undefined" ? config.rawData.build.generateUncompressedFiles : cmdLine.getBoolean(cmdLine.parameters.uncompressed);
for (var i=0, l=allValidPlatforms.length, p; i<l; i++){
	p = allValidPlatforms[i];
	config.setValue("platform", p);
	var files = new FileList().get(config.platformFile, config.features, config.sourceDirectory);
	var filesWithFullPath = files.map(function(f){ return config.sourceDirectory + f });	
	var buildFileNamePrefix = config.getBuildFilenamePrefix(config.profile, p);
	

	var uncompressedFileName;
	var compressedFileName;
	
	// Create uncompressed source file
	uncompressedFileName = buildFileNamePrefix + ".uncompressed.js";
	print("Writing uncompressed file for '" + p + "' to " + uncompressedFileName.replace(config.rootDirectory, ""));
	file.write(uncompressedFileName, ""); // Make sure the empty file exists!
	for (var j=0, l1=filesWithFullPath.length; j<l1; j++){
		file.appendFile(filesWithFullPath[j], uncompressedFileName);
	}
	
	
	// Create compressed source file.
	var fileContents = fileUtil.readFile(uncompressedFileName);
	
	// Setup shrinksafe params.
	var copyright = "";
	var optimizeType = "shrinksafe"; // TODO enable hooking other compressors in here ...
	if(cmdLine.parameters.keepLines){
		optimizeType += ".keepLines";
	}
	var stripConsole = cmdLine.parameters.stripConsole ? "all" : "none";
	
	compressedFileName = buildFileNamePrefix + ".js";
	file.write(compressedFileName, ""); // Make sure the empty file exists!
	print("Writing compressed file for '" + p + "' to " + compressedFileName.replace(config.rootDirectory, ""));

	// compress...
	try{
		fileContents = buildUtil.optimizeJs(compressedFileName, fileContents, copyright, optimizeType, stripConsole);
		
		//Write out the file with appropriate copyright.
		fileUtil.saveUtf8File(compressedFileName, fileContents);
	}catch(e){
		print("Could not compress file: " + compressedFileName + ", error: " + e);
	}
	
	if(!uncompressed){ // remove the uncompressed file
		print("Removing uncompressed file for '" + p + "'.");
		fileUtil.deleteFile(uncompressedFileName);
	}
	
	print("All done for '" + p + "'.");
	print("");

}
