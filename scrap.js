//Make the guard run
	interval_id = window.interval_id || 0
	clearInterval(interval_id)
	interval_id = setInterval(function(){
	  C(overlord).Velocity.x = -5
	  C('PushActions',{actions: ['run']}, overlord)
	},0)