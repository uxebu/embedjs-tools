EmbedJS Build tool
==================

While hacking on embedJS we realized that the build structure might be useful in other projects too. To make using it easier we provide the build tools separatly, and not only bundled with embedJS.
This is what this project is all about.

The philosophy
==============

EmbedJS' way to see files and build them might be different from the build and packaging tools you know, that's why let me dive a little bit into it's philosophy and some reasoning behind it.

Features
========

A build in embedJS is seen as a set of features, e.g. the kitchensink is made up out of the following features:
	base,array,connect,deferred,destroy,html,json,jsonp,lang,xhr,oo,uri,query
The short summary about what a features is:
1) a feature directly refer to one or multiple file(s) that implement it
   e.g. "connect" is implemented in "src/connect/connect.js" and "src/connect/event.js"
2) a feature may have nothing to do with the namespace that it is implemented in
   e.g. the feature "oo" (for object orientation) is implemented in the files "src/oo/declare.js", "src/oo/delegate.js", "src/oo/extend.js", if you know dojo, you know that this implements dojo.declare, dojo.delegate, dojo.extend.
   You see that the feature name "oo" has nothing to do with the function/method names.
   To support the difference in feature naming and JS namespaces the features are not separated by dots, like namespaces, but by dashed, e.g. "oo-declare".

Platforms
=========

If you look at a feature like "query" (the query engine) than it will become very quickly obvious that a feature may be implemented differently for each platform. Because some platforms may provide querySelectorAll, others might not, one wants to use sizzle, another acme as the query engine - it's the authors choice. And allowing the author to choose is exactly how the different platforms are implemented too. A feature has a mapping to which file(s) implement it - per platform!!!
Examples might show this best:
1) android.json
	...
	"query":[
		"src/query/qsa-preprocessor.js"
	],
	...
for android the implementation for the feature "query" can be found in the given file. For iOS the same implementation is used of course.

2) vodafone-apps-manager2.2.json
	...
	"query": [
		"dojo/query/acme.js"
	],
	...
By Vodafone's Widget Runtime (an Opera WRT) querySelectorAll() is not provided, so we use dojo's very own query engine "acme" to implement the feature "query".

One set of APIs
===============

As you might notice at this point, there might be multiple implementations for one features. But the most important thing is that they all target the same goal to create a unique base line across platforms - in other words provide exactly the same API!


