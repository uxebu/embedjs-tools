
var ebti = {
	
	platformNames: [],
		
	platforms: {},
	
	features: [],
	
	files: {},
	
	knownPaths: [],
	
	buildDetails: {},
	
	currentProfile: [],
	
	currentProfileName: '',
	
	loadConfigFromInput: function(){
		// reset
		this.platforms = {};
		this.features = [];
		this.files = {};
		// get config
		this.pathToConfig = dojo.byId('pathToConfig').value;
		this.getBuildConfig();
	},
	
	getBuildConfig: function(){
		dojo.xhrGet({
			url: this.pathToConfig + 'build-config.json',
			handleAs: 'json',
			load: dojo.hitch(this, 'onBuildConfigLoaded'),
			error: function(){ console.log('couldnt load config file'); }
		});
	},
	
	onBuildConfigLoaded: function(buildConfig){
		this.buildConfig = buildConfig;
		this.getPlatformNames();
	},
	
	getPlatformNames: function(){
		dojo.xhrGet({
			url: 'fileserver.php?cmd=getPlatforms&pathToPlatforms=' + this.pathToConfig + this.buildConfig.paths.platforms,
			handleAs: 'json',
			load: dojo.hitch(this, 'onPlatformNamesLoaded'),
			error: function(resp){
				console.log('error', resp);
			}
		});
	},
	
	onPlatformNamesLoaded: function(platformNames){
		this.platformNames = platformNames;
		this._platformsToLoad = platformNames.length;
		dojo.forEach(platformNames, dojo.hitch(this, "_loadPlatform"));
	},
	
	_loadPlatform: function(platformName){
		dojo.xhrGet({
			url: this.pathToConfig + this.buildConfig.paths.platforms + '/' + platformName + '.json',
			handleAs: 'json',
			load: dojo.hitch(this, function(platform){
				this.platforms[platformName] = platform;
				--this._platformsToLoad || this.onPlatformsLoaded();
			}),
			error: function(resp){
				console.log('error', resp);
			}
		});
	},
	
	onPlatformsLoaded: function(){
		delete(this._platformsToLoad);
		console.log('All platforms loaded.');
		
		var hasBase = !!this.platforms._base;
		
		for(var platformName in this.platforms){
			if(platformName != '_base'){
				// mixin
				if(hasBase){
					this.platforms[platformName] = dojo.mixin(dojo.clone(this.platforms._base), this.platforms[platformName]);	
				}
				// create feature overview. based on the assumption that every profile defines the same feature set.
				!this.features.length && this.listFeatures(this.platforms[platformName]);
			}
		}
		
		if(hasBase){
			delete this.platforms._base;
			this.platformNames = dojo.filter(this.platformNames, function(name){ return name != '_base'; });
		}
		
		this.renderFeatureList();
		this.renderProfileSelector();
		this.collectFileList();
		
	},
	
	listFeatures: function(platform){
		for(var feature in platform){
			this.features.push(feature);
		}
	},
	
	renderFeatureList: function(){
		var list = '';
		dojo.forEach(this.features, function(feature){
			var clazz = "featureItem";
			if(feature.split('-').length > 1){
				clazz += " indented";
			}
			list += '<div class="'+clazz+'"><input type="checkbox" id="feature'+feature+'" onchange="ebti.updateFeatures();"><label for="feature'+feature+'">'+feature+'</label></div>';
		}, this);
		dojo.byId('featureList').innerHTML = list;
	},
	
	renderProfileSelector: function(){
		var select = '<select id="profileSelect">';
		for( var profileName in this.buildConfig.profiles){
			select += '<option value="'+profileName+'">'+profileName+'</option>';
		}
		select += '</select>';
		
		dojo.query('span', dojo.byId('profileSelector'))[0].innerHTML = select;
	},
	
	preSelectProfile: function(){
		var select = dojo.byId('profileSelect');
		this.currentProfileName = select.options[select.selectedIndex].value;
		this.currentProfile = this.buildConfig.profiles[this.currentProfileName];
		
		this.clearAllFeatures();
		this.updateBuildDetails();
	},
	
	updateFeatures: function(updateFeatures){
		// obtain list
		var list = [];
		dojo.query('input', dojo.byId('featureList')).forEach(function(node){
			if(node.checked){
				list.push(node.id.substring(7));
			}
		});
		console.log(list);
		this.currentProfileName = 'custom';
		this.currentProfile = list;
		this.updateBuildDetails();
	},
	
	addFeature: function(featureName){
		dojo.byId('feature' + featureName).checked = true;
		// check platform implementations and deps
		dojo.forEach(this.platformNames, function(platformName){
			this._addFeatureForPlatform(featureName, platformName);
		}, this);
	},
	
	_addFeatureForPlatform: function(featureName, platformName, requestedBy){
		if(platformName.split('.').length > 1){ // oh noez :/
			var a = dojo.getObject('ebti.buildDetails', true);
			!a[platformName] && ( a[platformName] = {} );
			!a[platformName][featureName] && ( a[platformName][featureName] = {} );
			var buildSpec = a[platformName][featureName];	
		}else{
			var buildSpec = dojo.getObject('ebti.buildDetails.' + platformName + '.' + featureName, true); // Can't do if there's a dot somewhere :/	
		}
		if(buildSpec.isImplementedBy){
			return; // feature has already been processed;
		}
		buildSpec.isImplementedBy = this.platforms[platformName][featureName];
		buildSpec.requestedBy = requestedBy || '-';
		buildSpec.dependsOn = [];
		var fileList = dojo.clone(buildSpec.isImplementedBy);
		dojo.forEach(buildSpec.isImplementedBy, function(fileName){
			dojo.forEach(this.files[fileName].dependencies, function(depFeature){
				this._addFeatureForPlatform(depFeature, platformName, fileName);
				buildSpec.dependsOn.push(depFeature);
			}, this);
		}, this);
		buildSpec.fileList = fileList;
	},
	
	clearAllFeatures: function(){
		dojo.query('input', dojo.byId('featureList')).forEach(function(node){
			node.checked = false;
		}, this);
	},
	
	collectFileList: function(){
		dojo.map(this.platformNames, dojo.hitch(this, '_collectPlatformFiles'))
		
		// make the first round of dependency crawling
		dojo.forEach(this.knownPaths, function(path){
			this.fetchDependencyFile(path);
		}, this);
	},
	
	_collectPlatformFiles: function(platformName){
		if(platformName == '_base'){
			return; // All files herein are included in other platforms.
		}
		var platform = this.platforms[platformName];
		for(var featureName in platform){
			var list = platform[featureName];
			dojo.forEach(list, function(item){
				if(!this.files[item]){
					var path = item.substring(0, item.lastIndexOf('/')) + '/';
					this.files[item] = {
						path: path,
						dependencies: []
					};
					// add path, if not there already
					if(dojo.indexOf(this.knownPaths, path) < 0){
						this.knownPaths.push(path);
					}
				}
			}, this);
		}
	},
	
	fetchDependencyFile: function(path){
		var pathToFile = this.pathToConfig + this.buildConfig.paths.source + '/' + path;
		dojo.xhrGet({
			url: pathToFile + 'dependencies.json',
			handleAs: 'json',
			load: dojo.hitch(this, function(deps){
				for(var fileName in deps){
					var fixedFileName = path + fileName;
					
					// do we know this file?
					if(this.files[fixedFileName]){
						this.files[fixedFileName].dependencies = deps[fileName];
					}
					else{
						console.log('    file',fixedFileName,'is not known!! Path is:', path);
						this.files[fixedFileName] = {
							path: path,
							dependencies: deps[fileName]
						};
					}
				}
			}),
			error: function(){}
		});
	},
	
	onDependencyFileLoaded: function(deps){
		console.log(deps);
	},
	
	updateBuildDetails: function(){
		this.buildDetails = {};
		dojo.map(this.currentProfile, dojo.hitch(this, 'addFeature'));
		this.renderBuildDetails();
	},
	
	renderBuildDetails: function(){
		var isFirst = true;
		dojo.byId('platformsPane').innerHTML = '';
		dojo.forEach(this.platformNames, function(platformName){
			var container = dojo.create('div', { className: 'platformDetails'});
			isFirst && dojo.addClass(container, 'first');
			isFirst = false;
			var head = dojo.create('h2', { innerHTML: platformName}, container);
			var details = this.buildDetails[platformName];
			var platformFiles = [];
			for(var featureName in details){
				var featureContainer = dojo.create('div', { className: 'featureDetails' });
				var featureDetails = details[featureName];
				featureContainer.innerHTML = '<h6>'+featureName+'<div class="fDep" title="Feature has dependencies on: ' + ( featureDetails.dependsOn.length ? featureDetails.dependsOn : '-' ) + '">D</div><div class="fReq" title="Feature was requested by: '+featureDetails.requestedBy+'">R</div></h6>';
				dojo.forEach(featureDetails.isImplementedBy, function(file){
					var classNames = [];
					if(dojo.indexOf(platformFiles, file) > 0){ // already there
						classNames.push('included');
					}else{
						platformFiles.push(file);
					}
					featureContainer.innerHTML += '<div class="'+classNames.join(' ')+'">'+file+'</div>';
				}, this);
				container.appendChild(featureContainer);
			}
			var summary = dojo.create('div', { className: 'platformSummary'}, container);
			summary.innerHTML = 'Total files: ' + platformFiles.length;
			dojo.byId('platformsPane').appendChild(container);
		}, this);
	}
	
};
			

