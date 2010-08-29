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
	console.log("\n\nPLATOFMR:",p);
	console.log(files);
}





//print(config.sourceDirectory + fileList.get().join(" "+config.sourceDirectory));
