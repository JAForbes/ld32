var canvas;
document.body.appendChild(
	canvas = document.createElement('canvas')
)
var game = C({
	Screen: {
		canvas: canvas,
		context: canvas.getContext('2d'),
		ratio: 1
	},
	TileLayers: {
		Tiled: TileMaps
	}
})



var activeSystems = [
	'Screen',
	'DrawTiles'
]

loop = function(){
	activeSystems.forEach(function(name){
		systems[name]()
	})
	requestAnimationFrame(loop)
}
loop()

