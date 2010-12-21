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

// check what profile name to use for filename.
var customProfileName = cmdLine.parameters.customProfileName || config.profile;

for (var i=0, l=allValidPlatforms.length, p; i<l; i++){
	p = allValidPlatforms[i];
	config.setValue("platform", p);
	var files = new FileList().get(config.platformFile, config.features, config.sourceDirectory);
	var filesWithFullPath = files.map(function(f){ return config.sourceDirectory + f });
	
	var buildFileNamePrefix = config.getBuildFilenamePrefix(customProfileName, p);
	

	var uncompressedFileName;
	var compressedFileName;
	
	// Create uncompressed source file
	uncompressedFileName = buildFileNamePrefix + ".uncompressed.js";
	print("Writing uncompressed file for '" + p + "' to " + uncompressedFileName.replace(config.rootDirectory, ""));
	file.write(uncompressedFileName, ""); // Make sure the empty file exists!
	for (var j=0, l1=filesWithFullPath.length; j<l1; j++){
		file.appendFile(filesWithFullPath[j], uncompressedFileName);
	}
	print('  done.');
	
	// Create compressed source file.
	var fileContents = fileUtil.readFile(uncompressedFileName);
	
	// Setup shrinksafe params.
	var copyright = "";
	var optimizeType = "shrinksafe"; // TODO enable hooking other compressors in here ...
	if(cmdLine.getBoolean(cmdLine.parameters.keepLines)){
		optimizeType += ".keepLines";
	}
	var stripConsole = typeof cmdLine.parameters.stripConsole != "undefined" ? 
			( cmdLine.getBoolean(cmdLine.parameters.stripConsole) ? "all" : "none" ) :
			"all";
	
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
	
	// templating.
	print('');
	print('Templating:');

	
	// step 1: read template
	var tplName = config.templates.templatePath + config.templates.templateName + '.tpl';
	var tpl = fileUtil.readFile(tplName);
	
	// step 2: get path from template to relative root
	var tplDirDepth = config.rawData.templates.templatePath.split('/').length; // FIXME: This is wrong. If there are '..'-s in the path, this fails.
	var pathSuffix = '';
	while(tplDirDepth--){
		pathSuffix += '../';
	}
	
	// step 3: replace {{code}} (build)
	var buildTpl = tpl.replace('{{code}}', '<script src="' + pathSuffix + compressedFileName.replace(config.rootDirectory + '/', "") + '"></script>');
	
	// step 4: replace {{code}} (tags)
	var scriptTags = '\n';
	files.forEach(function(_filename){
		scriptTags += '<script src="' + pathSuffix + config.rawData.paths.source + '/' + _filename + '"></script>\n';
	})
	var tagsTpl = tpl.replace('{{code}}', scriptTags);
	
	// step 5: replace others
	var re = /\{\{[^\}]+\}\}/g;
	var tags = tpl.match(re);
	if(tags !== null){
		print('  additional tags found, replacing...');
		tags.forEach(function(_tag){
			if(_tag == '{{code}}'){
				return; // already done.
			}
			// let's see if there's a file...
			var _tagStripped = _tag.substring(2, _tag.length - 2);
			print('    checking ' + _tagStripped);
			var replName = config.templates.replacementPath + _tagStripped + '-' + p + '.tpl';
			var repl = fileUtil.readFile(replName);
			
			// replace action
			buildTpl = buildTpl.replace(_tag, repl);
			tagsTpl = tagsTpl.replace(_tag, repl);
		});
	}
	
	// step 6: write (build)
	var buildFileName = config.templates.templatePath + config.templates.templateName + '-' + customProfileName + '-' + p + '.html';
	print('  writing ' + buildFileName);
	fileUtil.saveFile(buildFileName, buildTpl, 'utf-8');

	// step 7: write (tags)
	var tagsFileName = config.templates.templatePath + config.templates.templateName + '-' + customProfileName + '-' + p + '.tags.html';
	print('  writing ' + tagsFileName);
	fileUtil.saveFile(tagsFileName, tagsTpl, 'utf-8');

	print('');
	print("All done for '" + p + "'.");
	print("");

}
