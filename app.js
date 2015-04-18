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
	Location: { x: 40, y: 150 },
	Dimensions: { width:16, height: 32 },
	Sprite: { image: s_player },
	Acceleration: { x:0, y:0 },
	Velocity: { x:0.5, y: 0.5 },
	//Gravity: { value: 0.4 },
	CollidesWith: {
		Solid: {
			Uncollide: {},
		}
	},
	SAT: {}
})


var activeSystems = [
	'Screen',
	'DrawSprites',
	'CollidesWith',
	'SAT_sync',
	'SAT',
	'Gravity',
	'Vulnerable',
	'Uncollide',
	'Move',
	'DeleteEntity',
	'RemoveComponent',
	'RemoveCategory'
]

loop = function(){
	activeSystems.forEach(function(name){
		systems[name]()

	})
	requestAnimationFrame(loop)
}
LoadTiles()
	.then(function(){
		TileMaps.bigger.layers[0].meta.forEach(function(meta,i){
		  C({
		    Location: { x: meta.x, y: meta.y },
		    Dimensions: {width: 16, height: 16},
		    Sprite: { image: TileMaps.bigger.sprites[meta.id-1] },
		    SAT: {},
		    CollidesWith: {},
		    Solid: {}
		  })
		})

	})
	.then(loop)

