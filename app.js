var canvas;
document.body.appendChild(
	canvas = document.createElement('canvas')
)
var game = C({
	Screen: {
		canvas: canvas,
		context: canvas.getContext('2d'),
		ratio: 1,
		scale: 2
	},
	TileMaps: TileMaps
})

var level = C({
	Level: {
		layers: ['small'],
		game: game
	}
})



var activeSystems = [
	'Screen',
	'DrawLevel'
]

loop = function(){
	activeSystems.forEach(function(name){
		systems[name]()
	})
	requestAnimationFrame(loop)
}
LoadTiles().then(loop)

