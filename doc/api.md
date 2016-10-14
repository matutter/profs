  - [File()](#filefilepath)
  - [File.flatten()](#fileflattenflatarray)
  - [walk()](#walkrootstringoptsobjectoptsfilterfunctionoptsonfilefunctionoptsondirectoryfunction)
  - [mkdirp()](#mkdirpfilepathstring)

## File(filepath:)

  The file object contains the dirname, basename, children, isFile or isDirectory value, and a stat() function.

## File.flatten(flat:Array)

  Flattens all File nodes into a single flat array.

## walk(root:String, opts:Object, opts.filter:Function, opts.onFile:Function, opts.onDirectory:Function)

  Will walk a file hierarchy and create an Object representation of it.
  If options are used 'filter' may be optional to trigger on all files be default.
  If options.onFile or onDirectory are used the root promise may return undefined.

## mkdirp(filepath:String)

  Creates all non-existing directories in a root-to-leaf direction after checking if the leaf doesn't exist.
  The root promise should be fulfilled in a race-tolerant way ( EEXIST are allowed after an ENOENT )
