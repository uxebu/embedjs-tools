var buildUtil = {};

buildUtil.optimizeJs = function(/*String fileName*/fileName, /*String*/fileContents, /*String*/copyright, /*String*/optimizeType, /*String*/stripConsole){
	//summary: either strips comments from string or compresses it.
	copyright = copyright || "";

	// understand stripConsole from dojo 1.3 and before
	if (stripConsole == "none") {
		stripConsole = undefined;
	} else if (stripConsole == "normal,warn") {
		//logger.info("Converting stripConsole "normal,warn" to \"warn\"
		logger.warn("stripConsole value \"normal,warn\" replaced with \"warn\".  Please update your build scripts.");
		stripConsole = "warn";
	} else if (stripConsole == "normal,error") {
		logger.warn("stripConsole value \"normal,error\" replaced with \"all\".  Please update your build scripts.");
		stripConsole = "all";
	}

	// sanity check stripConsole
	if (stripConsole != undefined && !stripConsole.match(/normal|warn|all/)) {
		throw "Invalid stripConsole provided (" + stripConsole + ")";
	}
	if (stripConsole == undefined) {
		// java will receive undefined as "undefined" but null as null.
		stripConsole = null;
	}

	//Use rhino to help do minifying/compressing.
	var context = Packages.org.mozilla.javascript.Context.enter();
	try{
		// Use the interpreter for interactive input (copied this from Main rhino class).
		context.setOptimizationLevel(-1);

		if(optimizeType.indexOf("shrinksafe") == 0 || optimizeType == "packer"){
			//Apply compression using custom compression call in Dojo-modified rhino.
			fileContents = new String(Packages.org.dojotoolkit.shrinksafe.Compressor.compressScript(fileContents, 0, 1, stripConsole));
			if(optimizeType.indexOf(".keepLines") == -1){
				fileContents = fileContents.replace(/[\r\n]/g, "");
			}
		}else if(optimizeType.indexOf("closure") == 0){
			var jscomp = com.google.javascript.jscomp;
			var flags = com.google.common.flags;

			//Fake extern
			var externSourceFile = buildUtil.closurefromCode("fakeextern.js", " ");

			//Set up source input
			var jsSourceFile = buildUtil.closurefromCode(String(fileName), String(fileContents));
		
			//Set up options
			var options = new jscomp.CompilerOptions();
			options.prettyPrint = optimizeType.indexOf(".keepLines") !== -1;
			var FLAG_compilation_level = flags.Flag.value(jscomp.CompilationLevel.SIMPLE_OPTIMIZATIONS);
			FLAG_compilation_level.get().setOptionsForCompilationLevel(options);
			var FLAG_warning_level = flags.Flag.value(jscomp.WarningLevel.DEFAULT);
			FLAG_warning_level.get().setOptionsForWarningLevel(options);

			//Run the compiler
			var compiler = new Packages.com.google.javascript.jscomp.Compiler(Packages.java.lang.System.err);
			result = compiler.compile(externSourceFile, jsSourceFile, options);
			fileContents = compiler.toSource();
		}else if(optimizeType == "comments"){
			//Strip comments
			var script = context.compileString(fileContents, fileName, 1, null);
			fileContents = new String(context.decompileScript(script, 0));
			
			//Replace the spaces with tabs.
			//Ideally do this in the pretty printer rhino code.
			fileContents = fileContents.replace(/    /g, "\t");

			//If this is an nls bundle, make sure it does not end in a ;
			//Otherwise, bad things happen.
			if(fileName.match(/\/nls\//)){
				fileContents = fileContents.replace(/;\s*$/, "");
			}
		}
	}finally{
		Packages.org.mozilla.javascript.Context.exit();
	}


	return copyright + fileContents;
}
