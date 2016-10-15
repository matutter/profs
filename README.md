[![Build Status](https://travis-ci.org/matutter/profs.svg?branch=master)](https://travis-ci.org/matutter/profs)
[![Coverage Status](https://coveralls.io/repos/github/matutter/profs/badge.svg?branch=master)](https://coveralls.io/github/matutter/profs?branch=master) [![dependencies Status](https://david-dm.org/matutter/profs/status.svg)](https://david-dm.org/matutter/profs)

Profs exports the _primisified_ fs library and includes multiple customized implimentation from fs-extra such as _walk_, _touch_, and _mkdirp_.

### mkdirp
Acts like the linux command "mkdir -p" and creates the full path to a directory. 
`mkdirp` Will not throw `EEXIST` or `ENOENT` but will throw for any other error.

```javascript
const fs = require('profs')
var path = 'this/doesnt/exit/yet'

fs.mkdirp(path).then(() => console.log('done!'))
```

### touch & touchp
Acts like the linux command "touch" and creates an empty file. `touchp` will create the path to the file if it doesn't exist.

```javascript
fs.touch('to/my/file.txt').then(() => console.log('done!'))
```

### walk
Recursively walks a given path and produces a _File tree_.

```javascript
fs.walk('path/to/dir').then( tree_root => {
  var everything = tree_root.flatten()
  tree_root.children.forEach(node => { /*...*/ })
})
```
The options include a _file filter_ function which is provided a `File` object and must return true to include it in the tree.

#### examples  
```javascript
// get all '.js' files
var options = {
  filter: file => file.isDirectory || file.endsWith('.js')
}
fs.walk('path/to/dir', options).then( tree_root => {
  var js_files = tree_root.flatten().filter(file => file.isFile)
})
```

```javascript
// get all '.js' file names using `onFile` callback
var js_files = []

var options = {
  filter: file => file.isDirectory || file.basename.endsWith('.js'),
  onFile: (file, parent) => js_files.push(file.basename)
}

fs.walk('..', options).return(js_files)
```



# API
### Generated with `dox`

  - [File()](#filefilepathstringdirnamestringbasenamestring)
  - [File.each()](#fileeachfnfunctionleaves_firstboolean)
  - [File.flatten()](#fileflattenfilterfunction)
  - [walk()](#walkrootstringoptsobjectobject)
  - [mkdirp()](#mkdirpfilepathstring)
  - [touch()](#touchpathstringbuffertruncatebooleanmodeinteger)
  - [removerf()](#removerffilepathstring)

## File(filepath:String, dirname:String, basename:String)

  The file object contains the dirname, basename, children, isFile or isDirectory value, and a stat() function.

## File.each(fn:Function, leaves_first:Boolean)

  Iterates a callback over all children, if the callback produces a promise it will resolve
  before subsequent children are iterated over.    
  
  If the `leaves_first` parameter is truthy the callback will iterate over the tree in a leaf-to-root direction.

## File.flatten(filter:Function)

  Flattens all File nodes into a single flat array.

## walk(root:String, opts:[object Object])

  Walk will recursively walk a directory structure creating a _file tree_ as it progresses.
  	The _file tree_ is a composite of _"nodes"_ where each node is a `File` object and may be traversed by the `File.children` property;
  	`File.children` is an array of `File` objects.    
  
  Walk will return the _root_ node once the promised is fulfilled.    
  	
  `options.filter` is a _filter function_ on each node which determines if a node will be included, or excluded, from the _file tree_.
  The filter option may also be an object with a `file` and `directory` filter function such as `{ file: f=>true, directory: d=>true }`;
  These explicit _filter functions_ are passed either only files or directories respectively.    
  
  The `onFile` and `onDirectory` functions are _handler_ functions which are pass the file or directory, the parent directory, and the options passed to
  the _walk_ function (if any).        
  
  The `filter`, if truthy, will flatten the _file tree_ before it is returned. This may also be a _filter function_ to return only specific Files.    
  
  	The promissory chain will wait for all `filter`, `onFile`, `onDirectory` callbacks to finish if they return a promise; returning a promise is not necessary.

## mkdirp(filepath:String)

  Creates all non-existing directories in a root-to-leaf direction after checking if the leaf doesn't exist.
  The root promise should be fulfilled in a race-tolerant way ( EEXIST are allowed after an ENOENT )

## touch(path:String|Buffer, truncate:Boolean, mode:Integer)

  Creates a file if it does not exist by opening it with 'a+', or truncating it with 'w+' when the truncate flag is truthy.
  	Will fail if the file cannot be read or written to (EACCESS) or is an existing directory (EISDIR).

## removerf(filepath:String)

  Recursively removes all files and folders.    
  Files will be unlinked, and directories are deleted with rmdir from leaf to root.
