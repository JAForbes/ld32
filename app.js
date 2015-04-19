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

var actions = {
	idle: { repeat: false },
	jump: { repeat: false },
	run: { repeat: true },
	crouch: { repeat: false }
}

var player = C({
	Angle: { value: 0 },
	Scale: { x: 1, y: 1 },
	Location: { x: 40, y: 150 },
	Dimensions: { width:16, height: 32 },
	Sprite: { image: s_player_idle_right },
	Frame: { play_speed: 0.3, index: 0, repeat: false, tile_width: 16, tile_height: 32 },
	Acceleration: { x:0, y:0 },
	Velocity: { x:0.5, y: 0.5 },
	Gravity: { value: 0.4 },

	Name: { value: 'player' },
	Action: { stack: [] , value: 'idle' },
	Position: { value: 'right' },

	CollidesWith: {
		Solid: {
			Uncollide: {}
		}
	},
	Has: {
		'Key_A|Key_LEFT': {
			Accelerate: { component: {x: -1} },
			Scale: { component: {x: -1} }
		},
		'Key_D|Key_RIGHT': {
			Accelerate: { component: {x: 1} },
			Scale: { component: {x: 1} }
		},
		'Key_S|Key_DOWN': {
			Sprite: { component: {image: s_player_standup_right } },
			Frame: { component: {index: 0 } },
		},
		'Key_W|Key_UP': {
			Accelerate: { component: {y: -1} },
			Sprite: { component: {image: s_player_jump_right } },
			Frame: { component: {index: 0 } ,every: Infinity, repeat: false },
		},
	},
	SAT: {}
})


var activeSystems = [
	'Screen',
	'Frame',
	'Action',
	'DrawSprites',
	'CollidesWith',
	'CategoryAge',
	'ComponentAge',
	'SAT_sync',
	'SAT',
	'Has',
	'Accelerate',
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
					//todo-james Need to use Tiled objects for collision instead of tiles
					//too performance intensive, and wasteful.  Already slows down with a tiny level.
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
	// .then(function(){
	// 	setInterval(loop,0)
	// })
	.then(loop)

