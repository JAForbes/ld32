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
	idle: { repeat: false, play_speed: 0.3 },
	//todo-james alter hold property on jump with some other system
	//that analyses if you are still in the air
	jump: { repeat: false, play_speed: 0.3, hold: false },
	run: { repeat: true, play_speed: 0.3 },
	standup: { repeat: false, play_speed: 0.3 }
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
	Action: {
		stack: [] , value: 'idle',
		hold: false,
		config: {
			idle: { repeat: false, play_speed: 0.3 },
			//todo-james alter hold property on jump with some other system
			//that analyses if you are still in the air
			jump: { repeat: false, play_speed: 0.3 },
			fall: { repeat: true, play_speed: 0.3 },
			run: { repeat: true, play_speed: 0.3 },
			standup: { repeat: false, play_speed: 0.3 },
			crouch: { repeat: true, play_speed: 0.3 },
		}

	},
	Position: { value: 'right' },

	CollidesWith: {
		Solid: {
			Uncollide: {}
		}
	},
	Has: {
		'Key_A|Key_LEFT': {
			Accelerate: { component: {x: -1} },
			Position: { component: {value: 'left'}},
		},
		'Key_D|Key_RIGHT': {
			Accelerate: { component: {x: 1} },
			Position: { component: {value: 'right'}} ,
		},
		'Key_S|Key_DOWN': {
			PushActions: { component: {actions: ['standup','crouch']}, every: Infinity }
		},
		'Key_W|Key_UP': {
			Accelerate: { component: {y: -1} },
			PushActions: { component: {actions: ['fall','jump']}, every: Infinity }
		}
	},
	Had: {
		'Key_S|Key_DOWN': {
			CancelAction: { action:'crouch' }
		}
	},
	SAT: {}
})


var activeSystems = [
	'Screen',
	'PushActions',
	'Action',
	'Frame',
	'DrawSprites',
	'CollidesWith',
	'CategoryAge',
	'ComponentAge',
	'SAT_sync',
	'SAT',
	'Has',
	'Had',
	'Accelerate',
	'Gravity',
	'Vulnerable',
	'Uncollide',
	'Landed',
	'CancelFall', //todo-james figure out a way to use Has instead of writing a new system for disabling fall
	'CancelAction',
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
	// 	setInterval(loop,500)
	// })
	.then(loop)

