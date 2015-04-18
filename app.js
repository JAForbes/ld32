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
	TileMaps: TileMaps,
	DrawOrder: { groups: ['Sprite'] }
})

var level = C({
	Level: {
		layers: ['bigger'],
		game: game
	}
})

var player = C({
	Location: { x: 40, y: 80 },
	Dimensions: { width:16, height: 32 },
	Sprite: { image: s_player },
	Acceleration: { x:0, y:0 },
	Velocity: { x:0, y: 0 }
})



var activeSystems = [
	'Screen',
	//todo-james DrawLevel should just update level sprites instead.  So we have one place where we draw
	'DrawLevel',
	'DrawSprites'
]

loop = function(){
	activeSystems.forEach(function(name){
		systems[name]()
	})
	requestAnimationFrame(loop)
}
LoadTiles()
	.then(loop)

