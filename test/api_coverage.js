var fs = Object.keys(require('fs'))
var pro = Object.keys(require('profs'))

var res = {
	api_coverage: 0,
	covered: [],
	value_add: []
}

pro.forEach(m => {
	if(~fs.indexOf(m))
		res.covered.push(m)
	else
		res.value_add.push(m)
})

res.api_coverage = '%'+(fs.length / res.covered.length)

console.log(JSON.stringify(res, null, 2))