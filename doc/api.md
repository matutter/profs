  - [File()](#filefilepathstring)
  - [File.flatten()](#fileflattenflatarray)
  - [walk()](#walkrootstringoptsobjectoptsfilterfunctionoptsonfilefunctionoptsondirectoryfunction)
  - [mkdirp()](#mkdirpfilepathstring)

## File(filepath:String)

  The file object contains the dirname, basename, children, isFile or isDirectory value, and a stat() function.

## File.flatten(flat:Array)

  Flattens all File nodes into a single flat array.

## walk(root:String, opts:Object, opts.filter:Function, opts.onFile:Function, opts.onDirectory:Function)

  Walk will recursively walk a directory structure creating a _file tree_ as it progresses.
  	The _file tree_ is a composite of _"nodes"_ where each node is a `File` object and may be traversed by the `File.children` property;
  	`File.children` is an array of `File` objects.    
  
  Walk will return the _root_ node once the promised is fulfilled.    
  	
  `options.filter` is a _filter function_ on each node which determines if a node will be included, or excluded, from the _file tree_.
  	The promissory chain will wait for all `filter`, `onFile`, `onDirectory` callbacks to finish if they return a promise.

## mkdirp(filepath:String)

  Creates all non-existing directories in a root-to-leaf direction after checking if the leaf doesn't exist.
  The root promise should be fulfilled in a race-tolerant way ( EEXIST are allowed after an ENOENT )
