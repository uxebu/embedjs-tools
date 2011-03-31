var args = Array.prototype.slice.call(arguments);
var _jsToolsPath = environment["user.dir"] + "/" + args[0];
load(_jsToolsPath + "/lib/_global.js");
load(_jsToolsPath + "/lib/util.js");
load(_jsToolsPath + "/lib/dojo.js");
load(_jsToolsPath + "/lib/cmdLine.js");
load(_jsToolsPath + "/lib/config.js");
load(_jsToolsPath + "/lib/file.js");
load(_jsToolsPath + "/lib/platform.js");

// Command config
cmdLine.setup(args.slice(2), {
	parameters:
		defaultCmdLineParameters
		.concat(platform.cmdLineParamsAddOn) // Add the params normally used when working on platforms stuff.
		.concat(
			[
				{
					name:"dev",
					help:"Generate the tests in dev mode, which means don't include builds but each source file.",
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
var allValidPlatforms = platform.getAllValid(config.platformsDirectory);

function renderRunTestsTpl(content, platform, isWidget, files){
	// summary: Render the runTests.html.tpl for the given platform.
	var directory = isWidget ? "embedJS/" : "../build/";
	if (files && files.length){
		files = files.map(function(f){ return "../" + config.buildPath(config.rawData.paths.source, f, false) });
		fillString = files.join('"></script>\n\t\t<script type="text/javascript" src="');
	} else {
		fillString = directory + "embed-kitchensink-" + platform + ".js"
	}
	var ret = content.replace("${embedjs_filename}", fillString);
	var ret = ret.replace("${platform}", platform);
	return ret;
}

function renderIndexTpl(platforms){
	// summary: Take the index.html.tpl apart and render the {loop} part in there for all platforms.
	var tpl = readFile(config.testsDirectory + "index.html.tpl");
	// Parse out the ONE loop that is in the index.html.tpl
	var loop = tpl.match(/([.\s\S]*)\{loop\}([.\s\S]*)\{endloop\}([.\s\S]*)/);
	var loopContent = loop[2];
	var ret = "";
	for (var i=0, l=platforms.length, p; i<l; i++){
		p = platforms[i];
		ret += 	loopContent.replace(/\$\{platform\}/g, p);
	}
	return loop[1] + ret + loop[3];
}

function writeFile(fileName, content){
	var f = new FileWriter(fileName);
	f.write(content);
	f.close();
}

//
//	Main
//
// TODO Currently hardcoded that the tests dir is under the root, make it configurable!?
var tpl = readFile(config.testsDirectory + "runTests.html.tpl");
importPackage(java.io); // So we can use FileWriter.
for (var i=0, l=allValidPlatforms.length, p; i<l; i++){
	p = allValidPlatforms[i];
	// Write the normal file.
	var destFile = config.testsDirectory + "runTests-" + p + ".html";
	print("Writing '" + destFile + "'");
	writeFile(destFile, renderRunTestsTpl(tpl, p));
	// Write the test file for the widget env.
	var destFile = config.testsDirectory + "runTests-widget-" + p + ".html";
	print("Writing '" + destFile + "'");
	writeFile(destFile, renderRunTestsTpl(tpl, p, true));
	// Write the dev file if configured.
	if (cmdLine.parameters.dev){
		// Get all the files that need to be included.
		config.setValue("platform", p);
		var files = new FileList().get(config.platformFile, config.features, config.sourceDirectory);
		//var filesWithFullPath = files.map(function(f){ return config.sourceDirectory + f });
		
		var destFile = config.testsDirectory + "runTests-dev-" + p + ".html";
		print("Writing '" + destFile + "'");
		writeFile(destFile, renderRunTestsTpl(tpl, p, false, files));
	}
}
destFile = config.testsDirectory + "index.html";
print("Writing '" + destFile + "'");
writeFile(destFile, renderIndexTpl(allValidPlatforms));

//*/