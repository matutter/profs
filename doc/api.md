  - [File()](#filefilepathstring)
  - [File.flatten()](#fileflattenflatarray)
  - [walk()](#walkrootstringoptsobjectoptsfilterfunctionoptsonfilefunctionoptsondirectoryfunction)
  - [mkdirp()](#mkdirpfilepathstring)

## File(filepath:String)

  The file object contains the dirname, basename, children, isFile or isDirectory value, and a stat() function.

## File.flatten(flat:Array)

  Flattens all File nodes into a single flat array.

## walk(root:String, opts:Object, opts.filter:Function, opts.onFile:Function, opts.onDirectory:Function)

  Will walk a file hierarchy and create a _File tree_ representation of it, where each node is a `File` object.
  The root node is provided when the promise resolves.
  If options.filter is used it will act as a _filter function_ on each node.
  If the `filter`, `onFile`, or `onDirectory` options are used the promissory chain will wait for them to be fulfilled before it is fulfilled.

## mkdirp(filepath:String)

  Creates all non-existing directories in a root-to-leaf direction after checking if the leaf doesn't exist.
  The root promise should be fulfilled in a race-tolerant way ( EEXIST are allowed after an ENOENT )
