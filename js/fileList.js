var fileList = {
	
	// We store some global information here, so we dont need to pass them around.
	_modules:{},
	_dependencyData:{}, // Indexed by the directory where the __deps__.js file was loaded from, so we dont load them multiple times.
	_modulesAdded:{},
	
	get:function(){
		// summary:
		// 		Load the platform JSON file (like Android.json) which contains all the features mapped to the exact js files.
		// description:
		// 		If features are given resolve teh dependencies and concat the files resulting form that.
		var modules = util._loadJsonFile(config.platformFile);
		this._modules = modules;
		var files = [];
		if (config.features.length==0){
			for (var m in modules){
				console.log("Adding feature:     ", m);
				var moduleFiles = modules[m].map(util.hitch(this, "resolveDeps"))
				console.log(moduleFiles.length ? ("+++ " + moduleFiles.join(" ")) : "");
				files = files.concat(moduleFiles);
				this._modulesAdded[m] = true;
			}
		} else {
			for (var i=0, l=config.features.length, f; i<l; i++){
				var f = config.features[i];
				if (typeof modules[f]=="undefined"){
					console.error("ERROR: Feature '" + f + "' not defined in '" + config.platformFile + "'. ");
					console.error("Make sure (or create) the feature exists or you may have a typo in the feature name.");
					console.error("Giving up :(\n\n");
					quit();
				}
				console.log("Adding feature:     ", f);
				var moduleFiles = [];
				modules[f].map(util.hitch(this, "resolveDeps")).map(function(arr){ moduleFiles = moduleFiles.concat(arr) });
				console.log(moduleFiles.length ? ("+++ " + moduleFiles.join(" ")) : "");
				files = files.concat(moduleFiles);
			}
		}
		console.log("\nCleaning up file list, removing doubles, etc.");
		// Remove doubles but never the first occurence, since this would break the file order dependencies.
		var files = files.map(function(item, index){return (files.slice(0, index).indexOf(""+item)!=-1) ? null : item; })
						.filter(function(item){ return item==null ? false : true });
		return files;
	},
	
	resolveFeature:function(feature){
		var ret = [];
		if (!this._modulesAdded[feature]){
			console.log('  Resolving feature:', feature);
			var parts = feature.split("-");
			var ns = parts[0]; // The namespace of the feature, like "oo" in "oo" or "oo-declare or "oo-extend".
			var f = parts.length>1 ? parts[1] : null; // The exact feature if given, like for "oo-declare".
			var data = this._modules;
			if (f===null){
				// If the feature is only "oo" then we use ALL files given inside "oo".
				ret = data[ns];
				for (var i=0, l=ret.length; i<l; i++){
					this.resolveDeps(ret[i], function(files){
						ret = ret.concat(files);
					});
				}
			} else {
				// A features like "oo-declare" means we only want the features inside "oo"
				// where the file is "*declare.*", if given of course.
				for (var j=0, l=data[ns].length, file; j<l; j++){
					file = data[ns][j];
					if (file.indexOf(f)!=-1){
						ret.push(file);
						this.resolveDeps(file, function(files){
							ret = ret.concat(files);
						});
					}
				}
			}
			console.log('    Adding files:       ===>', ret);
		} else {
			console.log("  Depends on '" + feature + "', already resolved before.");
		}
		return ret;
	},
	
	
	resolveDeps:function(file){
		// summary:
		// 		Resolve the dependencies of file (e.g. array/_default.js).
		// description:
		// 		If a dependencies.json file exists in the path where the js file is in, e.g. "array",
		// 		then we load all according files again (which are namely features, which need to be
		// 		mapped to files again, resolveFeature() does that).
		if (typeof this._dependencyData[file]=="undefined"){
			var path = file.split("/");
			var f = path.pop(); // The filename e.g. "declare.js"
			var deps = util._loadJsonFile(config.sourceDirectory + (path.length?path.join("/"):"") + "/dependencies.json", false);
			//this._dependencyData[file] = (typeof deps[f]!="undefined" ? deps[f] : []).map(resolveFeature);
			this._dependencyData[file] = this._reduce((deps && typeof deps[f]!="undefined" ? deps[f] : [])
											.map(util.hitch(this, "resolveFeature"))) // Resolve the features
											.filter(function(i){return !!i;}); // Return empty elements that map might had returned.
		}
		return this._dependencyData[file].concat([file]); // I don't know if we want to KNOW here that we have to concat "file" too.
	},
	
	_reduce:function(arr){
		// flatten the array
		var ret = [];
		arr.map(function(i){ ret = ret.concat(i) });
		return ret;
	}
}