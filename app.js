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
	DrawOrder: { groups: ['Tile','Enemy','Crate','Ladder','Player','Projectile'] }
})

var level = C({
	Level: {
		layers: ['bigger'],
		game: game
	}
})

var actions = {
	idle: { repeat: false, play_speed: 0.3 },
	run: { repeat: true, play_speed: 0.3 },
	standup: { repeat: false, play_speed: 0.3 }
}

var player = C({
	Angle: { value: 0 },
	Location: { x: 130, y: 250 },
	Dimensions: { width:16, height: 32 },
	Sprite: { image: s_player_idle_right },
	Frame: { play_speed: 0.3, index: 0, repeat: false, tile_width: 16, tile_height: 32 },
	Acceleration: { x:0, y:0 },
	Velocity: { x:0.5, y: 0.5 },
	Gravity: { value: 0.4 },
	Name: { value: 'player' },
	Player: {},
	Hider: {},
	Friction: { value: 0.9 },
	Action: {
		stack: [] , value: 'idle',
		hold: false,
		config: {
			idle: { repeat: false, play_speed: 0.3 },
			jump: { repeat: false, play_speed: 0.3 },
			fall: { repeat: true, play_speed: 0.3 },
			run: { repeat: false, play_speed: 0.06 },
			standup: { repeat: false, play_speed: 0.3 },
			crouch: { repeat: true, play_speed: 0.3 },
			die: { repeat: false, play_speed: 0.3 },
			dead: { repeat: true, play_speed: 0.3 }
		}

	},
	Position: { value: 'right' },
	CollidesWith: {
		Solid: {
			Uncollide: {}
		},
		Projectile: {
			ReplaceActions: { actions: ['dead','die']},
		},
		Climbable: {
			Climber: {}
		},
		End: {
			Log: { message: 'End of Level '},
			NextLevel: { game: game }
		}
	},
	Has: {
		'Key_W|Key_UP': {
			Climb: { component: { x:0, y: -0.5 } }
		},
		'Key_S|Key_DOWN': {
			Climb: { component: { x:0, y: 0.5 } }
		},
		'Key_A|Key_LEFT': {
			Accelerate: { component: {x: -0.1} },
			Position: { component: {value: 'left'}},
			PushActions: { component: {actions: ['run']} }
		},
		'Key_D|Key_RIGHT': {
			Accelerate: { component: {x: 0.1} },
			Position: { component: {value: 'right'}} ,
			PushActions: { component: {actions: ['run']} }
		},
		'Key_S|Key_DOWN': {
			ReplaceActions: { component: {actions: ['standup','crouch']}, every: Infinity }
		},
		'@Action_dead': {
			Remove: { component: {} }
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
	SATSync: {},
	// Repeat: {
	// 	Log: {
	// 		component: { message: 'Repeating message'}, remaining: 100
	// 	}
	// }


})

var cameraBot = C({
		Dimensions: { width: 50, height: 50 },
		Location: { x:50, y:250 },
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

Guard = {
	Enemy: {},
	Angle: { value: 0 },
	Location: { x: 280, y: 200 },
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
		config: {
			idle: { repeat: false, play_speed: 0.3 },
			run: { repeat: true, play_speed: 0.06 },
		}

	},
	SAT: {},
	SATSync: {},
	CollidesWith: {
		Solid: {
			Uncollide: {}
		}
	},
	//todo-james render the sight ray
	Sight: { range: 75, offset: {x:0, y: -10} },
	See: {
		Player: {
			Attack: {}
		}
	}
}

TurningGuard = _.cloneDeep(Guard)
TurningGuard.Repeat = {
	Procedure: {
		component: {
			steps: [
				{ time: 150, components: { Position: {value: 'left' } } },
				{ time: 150, components: { Position: {value: 'right'} } },
			],
			current: 0,
			clock: 0
		},
		remaining: Infinity
	}
}

PatrollingGuard = _.cloneDeep(Guard)
PatrollingGuard.Repeat = {
		Procedure: {
			component: {
					steps: [
						{ time: 250,
							components: {
								Position: {value: 'left' },
								Velocity: { x: -1, y: 0 },
								Friction: { value: 1 },
								PushActions: { actions: ['run'] },
							}
						},
						{ time: 250,
							components: {
								Position: {value: 'right' },
								Velocity: { x: 1, y: 0 },
								Friction: { value: 1 },
								PushActions: { actions: ['run'] },
							}
						},
						{ time: 1,
							components: {
								Friction: { value: 0.9 },
								CancelAction: { action: 'run' }
							}
						},
					],
					current: 0,
					clock: 0
				},
			remaining: Infinity
		}
}

//create guard
C(_.cloneDeep(TurningGuard))

//create guard
var patrolling = C(_.cloneDeep(PatrollingGuard))
C(patrolling).Location.x = 500
C(patrolling).Location.y = 150


//create guard
var patrolling = C(_.cloneDeep(PatrollingGuard))
C(patrolling).Location.x = 200
C(patrolling).Location.y = 0

//create patrolling guard
var patrolling = C(_.cloneDeep(PatrollingGuard))
C('Location', { x: 450, y: -200}, patrolling)

//create guard
var patrolling = C(_.cloneDeep(PatrollingGuard))
C(patrolling).Location.x = 750


var activeSystems = [
	'Procedure',
	'Screen',
	'Camera',
	'PushActions',
	'ReplaceActions',
	'Action',
	'ActionTag',
	'Frame',
	'DrawSprites',
	'CollidesWith',
	'CategoryAge',
	'ComponentAge',
	'SAT_sync',
	'SAT',
	'Hidden',
	'Sight',
	'Attack',
	'Log',
	'Has',
	'Had',
	'Accelerate',
	'Gravity',
	'Vulnerable',
	'Uncollide',
	'Landed',
	'CancelAction',
	'Friction',
	'Tether',
	'Climb',
	'Move',
	'GarbageCollection',
	'DeleteEntity',
	'RemoveComponent',
	'RemoveCategory',
	'RemoveEntity',
	'Repeat'
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
					var entity = C({
						Location: { x: meta.x, y: meta.y },
						Dimensions: {width: level.tilewidth, height: level.tileheight},
						Sprite: { image: level.sprites[meta.id-1] }
					})
					if(layer.properties){
						var components = _.reduce(layer.properties, function(components, val, key){
							components[key] = { value: val }
							return components;
						},{})
						C(components,entity)
					}
				})
				if(layer.objects){
					layer.objects.forEach(function(object){

						var entity = C({
						    CollidesWith: {},
						    SAT: { box: new SAT.Box(new SAT.Vector(object.x,object.y), object.width, object.height) },
						})
						if(layer.properties || object.properties){
							var properties = _.extend({},layer.properties,object.properties)
							var components = _.reduce(properties, function(components, val, key){
								components[key] = { value: val }
								return components;
							},{})
							C(components,entity)
						}
					})
				}
			})
		})

	})
	// .then(function(){
	// 	setInterval(loop,500)
	// })
	.then(loop)

