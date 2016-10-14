[![Build Status](https://travis-ci.org/matutter/profs.svg?branch=master)](https://travis-ci.org/matutter/profs)
[![Coverage Status](https://coveralls.io/repos/github/matutter/profs/badge.svg?branch=master)](https://coveralls.io/github/matutter/profs?branch=master) [![dependencies Status](https://david-dm.org/matutter/profs/status.svg)](https://david-dm.org/matutter/profs)

Profs exports the _primisified_ fs library and includes multiple customized implimentation from fs-extra such as _walk_, _touch_, and _mkdirp_.

### mkdirp
Acts like the linux command "mkdir -p" and creates the full path to a directory. wont throw for `EEXIST` or `ENOENT` but most likely an `EACCESS` if at all.

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
Recursively walks a given path creates a _File tree_.

```javascript
fs.walk('path/to/dir').then( tree_root => {
  var everything = tree_root.flatten()
  tree_root.children.forEach(node => { /*...*/ })
})
```


