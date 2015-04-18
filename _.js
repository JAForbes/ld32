_ = {
	each: function(object, visitor){
		Object.keys(object).forEach(function(key){
			visitor(object[key],key,object)
		})
	},

	times: function(n, visitor){
		var results = []
		for(var i = 0; i < n; i++){
			results.push(visitor(i))
		}
		return results
	}
}