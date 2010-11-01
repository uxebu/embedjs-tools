var args = Array.prototype.slice.call(arguments);
var _jsToolsPath = environment["user.dir"] + "/" + args[0];
load(_jsToolsPath + "/lib/_global.js");
load(_jsToolsPath + "/lib/util.js");
load(_jsToolsPath + "/lib/dojo.js");
load(_jsToolsPath + "/lib/cmdLine.js");
load(_jsToolsPath + "/lib/config.js");
load(_jsToolsPath + "/lib/file.js");

// Command config
cmdLine.setup(args.slice(2), {
	parameters:defaultCmdLineParameters
});

// Handle config stuff
config.loadData(args[1]);
config.setValues(cmdLine.parameters);
//console.log('config = ', config);

load(_jsToolsPath + "/lib/FileList.js");

// Output
var files = new FileList().get(config.platformFile, config.features, config.sourceDirectory);
print(config.sourceDirectory + files.join(" "+config.sourceDirectory));
