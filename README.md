[![Build Status](https://travis-ci.org/matutter/profs.svg?branch=master)](https://travis-ci.org/matutter/profs)
[![Coverage Status](https://coveralls.io/repos/github/matutter/profs/badge.svg?branch=master)](https://coveralls.io/github/matutter/profs?branch=master) [![dependencies Status](https://david-dm.org/matutter/profs/status.svg)](https://david-dm.org/matutter/profs)

Profs currently wraps 28% of the existing fs module and adds an additional 6 methods.


Extra methods include.
## Unique to profs
The fs module is exported for utility. 
```javascript
var pro = require('./profs.js')
pro.fs.writeFileSync('file', "I'm a normal fs function")
pro.readFile('file', 'utf8')
.then(console.log)
.then(() => pro.unlink('file'))
.catch(console.error)
```
### 1.0 fs.stat
The ```fs.stat``` object has a ```path``` property containing the fully-qualified path to the file; this makes unbound chaining more simple.
### 1.1 mkdirp
Acts like the linux command "mkdir -p" and creates the full path to a directory.
### 1.2 touch
Acts like the linux command "touch" and create an empty file.
### 1.3 readdirStat
Creates an array of fs.stats for each file in a directory.
### 1.4 walk
Recursively read directories creating a ```{files:[], directories:[]}``` object of either fs.stats or fully-qualified paths.
### 1.5 removerf 
Remove a folder and all of it's contents.
