var canvas;
document.body.appendChild(
	canvas = document.createElement('canvas')
)

var game = C({
	Camera: { tracking: 3 , last_position: {x:0, y:0 }, scale: 8},
	Screen: {
		canvas: canvas,
		context: canvas.getContext('2d'),
		ratio: 1
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
	Location: { x: 150, y: 150 },
	Dimensions: { width:16, height: 32 },
	Sprite: { image: s_player_idle_right },
	Frame: { play_speed: 0.3, index: 0, repeat: false, tile_width: 16, tile_height: 32 },
	Acceleration: { x:0, y:0 },
	Velocity: { x:0.5, y: 0.5 },
	Gravity: { value: 0.4 },
	Name: { value: 'player' },
	Friction: { value: 0.9 },
	Action: {
		stack: [] , value: 'idle',
		hold: false,
		config: {
			idle: { repeat: false, play_speed: 0.3 },
			//todo-james alter hold property on jump with some other system
			//that analyses if you are still in the air
			jump: { repeat: false, play_speed: 0.3 },
			fall: { repeat: true, play_speed: 0.3 },
			run: { repeat: false, play_speed: 0.06 },
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
			Accelerate: { component: {x: -0.25} },
			Position: { component: {value: 'left'}},
			PushActions: { component: {actions: ['run']} }
		},
		'Key_D|Key_RIGHT': {
			Accelerate: { component: {x: 0.25} },
			Position: { component: {value: 'right'}} ,
			PushActions: { component: {actions: ['run']} }
		},
		'Key_S|Key_DOWN': {
			PushActions: { component: {actions: ['standup','crouch']}, every: Infinity }
		}
	},
	Had: {
		'Key_S|Key_DOWN': {
			CancelAction: { action:'crouch' }
		},
		'Key_A|Key_LEFT|Key_D|Key_RIGHT': {
			CancelAction: { action:'run' }
		}
	},
	SAT: {},
	SATSync: {}
})

var cameraBot = C({
		Dimensions: { width: 50, height: 50 },
		Location: { x:10, y:14 },
		Velocity: { x:0, y: 0},
		Dimensions: { width: 32, height: 32},
		Angle: { value: 0 },
		Particle: {},
		Acceleration: { x:0 , y:0 },
		//Stability of camera: Screenshake
		Friction: { value: 0.9 },
		//Don't see past the boundary
		PanBoundary: { x:-1200, y:-1200, width: 2400, height: 2400 }
	})
	C('Tether',{ entity: player , elasticity: 0.1 },cameraBot)
	C('Camera',game).tracking = cameraBot


var overlord = C({
	Angle: { value: 0 },
	Location: { x: 200, y: 150 },
	Dimensions: { width:16, height: 32 },
	Sprite: { image: s_player_idle_right },
	Frame: { play_speed: 0.3, index: 0, repeat: false, tile_width: 16, tile_height: 32 },
	Acceleration: { x:0, y:0 },
	Velocity: { x:0.5, y: 0.5 },
	Gravity: { value: 0.4 },
	Name: { value: 'player' },
	Friction: { value: 0.9 },
	Position: { value: 'left' },
	Action: {
		stack: [] , value: 'idle',
		hold: false,
		config: { idle: { repeat: false, play_speed: 0.3 } }
	},
	SAT: {},
	SATSync: {},
	CollidesWith: {
		Solid: {
			Uncollide: {}
		}
	},
})

var activeSystems = [
	'Screen',
	'Camera',
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
	'Friction',
	'Tether',
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
					})
				})
				if(layer.objects){
					layer.objects.forEach(function(object){

						C({
						    CollidesWith: {},
						    SAT: { box: new SAT.Box(new SAT.Vector(object.x,object.y), object.width, object.height) },
						    Solid: {},
						    TiledProps: object.properties
						})
					})
				}
			})
		})
		TileMaps.bigger.layers[0].meta.forEach(function(meta,i){

		})

	})
	// .then(function(){
	// 	setInterval(loop,500)
	// })
	.then(loop)

