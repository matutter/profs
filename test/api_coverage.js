var fs = Object.keys(require('fs'))
		.filter(method=>method.indexOf('Sync')==-1)
var pro = Object.keys(require('profs'))
var util = require('util')

var res = {
	api_coverage: 0,
	api_isAsync: fs.length,
	covered: [],
	value_add: []
}

pro.forEach(m => {
	if(~fs.indexOf(m))
		res.covered.push(m)
	else
		res.value_add.push(m)
})

res.api_coverage = '%'+Math.round(res.covered.length/fs.length*100)

console.log(fs)

var json = JSON.stringify(res, null, 2)
var format = 'Coverage for async fs api\n```json\n`%s\n```'
console.log(util.format(format, json))