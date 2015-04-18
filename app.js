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
		_.each(TileMaps, function(level){
			level.layers.forEach(function(layer){
				layer.meta.forEach(function(meta){
					C({
						Location: { x: meta.x, y: meta.y },
						Dimensions: {width: level.tilewidth, height: level.tileheight},
						Sprite: { image: level.sprites[meta.id-1] },

						//todo-james set collision and other properties conditionally based on Tiled flags
						SAT: {},
						CollidesWith: {},
						Solid: {}
					})
				})
			})
		})
		TileMaps.bigger.layers[0].meta.forEach(function(meta,i){

		})

	})
	.then(loop)

