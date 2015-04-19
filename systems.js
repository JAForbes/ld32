systems = {
	Screen: function(){
		_.each(C('Screen'), function(screen, id){
			screen.canvas.width = screen.ratio * window.innerWidth
			screen.canvas.height = screen.ratio * window.innerHeight
			screen.context.mozImageSmoothingEnabled =
			screen.context.msImageSmoothingEnabled =
			screen.context.imageSmoothingEnabled = false;
		})
	},

	Frame: function(){
		_.each(C('Frame'), function(frame, id){
			var sprite = C('Sprite',id)
			frame.index += frame.play_speed
			var tiles = sprite.width / sprite.height
			var finalIndex = (sprite.image.width / frame.tile_width) -1


			if(frame.index >= finalIndex){
				if(frame.repeat){
					frame.index = 0
				} else {
					frame.index = finalIndex
				}
			}
		})
	},

	Camera: function(){
		_.each( C('Camera'), function(camera, id){

			var screen = C('Screen',id)
			camera.lag = camera.lag || 25
			camera.last_position = camera.last_position || {x:0,y:0}
			var track_position = C('Location',camera.tracking)
			var position = {
				x: track_position.x || camera.last_position.x,
				y: track_position.y || camera.last_position.y
			}

			var offset = { x: 0, y: 0 };
			var dx = position.x - camera.last_position.x
			var dy = position.y - camera.last_position.y

			offset.x = camera.last_position.x + dx//(dx/camera.lag) * 0.5
			offset.y = camera.last_position.y + dy//(dy/camera.lag) * 0.5



			screen.context.scale(camera.scale,camera.scale)
			screen.context.translate(-offset.x,-offset.y)
			screen.context.translate(screen.canvas.width/(2*camera.scale),screen.canvas.height/(2*camera.scale))

			camera.last_position = offset;
		})
	},

	Tether: function(){
		_.each(C('Tether'),function(tether,id){
			var other = C('Location',tether.entity)
			if( _.isEmpty(other) ){
				other = tether.last_position || {x:0,y:0}
			}
			var p = C('Location',id)
			var dx = Math.abs(p.x - other.x)
			var dy = Math.abs(p.y - other.y)
			var angle = C('Angle',id).value = Math.atan2(other.y-p.y, other.x-p.x)

			var acceleration = C('Acceleration', id)
			acceleration.x += Math.cos(angle) * dx * tether.elasticity
			acceleration.y += Math.sin(angle) * dy * tether.elasticity
			tether.last_position = { x: other.x, y: other.y}

		})
	},

	//todo-james Have a general push component/system
	PushActions: function(){
		_.each( C('PushActions'), function(pushActions, id){
			C('Action',id).stack = _.unique(C('Action',id).stack.concat(pushActions.actions))
		})
		C.components.PushActions && C('RemoveCategory', {name: 'PushActions'})
	},

	/*
		Automatically transitions between different animation sprites.

		If something in the stack has repeat true.  It must be manually popped off the stack.
		Otherwise this system will manage the transition.

		A convention is used to match actions & positions to images.
		There must be an image with a global ref of the form

			s_<name.value>_action.value_<position.value>

			s_player_jump_right

		And an actions hash that globally has frame settings for whether to repeat the animation

	*/
	//todo-james store sprites as a component instead of globally
	Action: function(){
		_.each( C('Action'), function run(action, id) {


			var name = C('Name',id);
			var position = C('Position',id);
			var sprite = C('Sprite',id)
			var frame = C('Frame',id)
			var finalIndex = Math.floor((sprite.image.width / frame.tile_width) -1)
			if(!frame.repeat && !frame.hold && frame.index >= finalIndex || !action.value){

				var next = action.stack.pop();
				if(next == action.value) next = action.stack.pop()
				action.value = next || 'idle'
			}

			var position_update = sprite.image.src.indexOf(position.name) == -1
			var frame_update = sprite.image.src.indexOf(action.value) == -1 || position_update

			if(frame_update){
				sprite.image = window['s_'+name.value+'_'+action.value+'_'+position.value]
				//mixin action settings to the frame
				C('Frame', action.config[action.value], id )
				//reset the frame

				!position_update && (frame.index = 0)
			}
		})
	},

	DrawSprites: function(){

		_.each(C('DrawOrder'), function(drawOrder, id){
			var screen = C('Screen',id)
			var camera = C('Camera', id)
			var halfScreenWidth = (screen.canvas.width / camera.scale) /2
			var halfScreenHeight = (screen.canvas.width / camera.scale) /2
			var edge = {}
			edge.left = camera.last_position.x - halfScreenWidth
			edge.right = camera.last_position.x + halfScreenWidth
			edge.top = camera.last_position.y - halfScreenHeight
			edge.bottom = camera.last_position.y + halfScreenHeight


			drawOrder.groups.forEach(function(group){
				_.each(C(group), function(someComponent, entity_id){

					var location = C('Location',entity_id)
					var dimensions = C('Dimensions',entity_id)

					var outside = (
						location.x + dimensions.width 	< edge.left  ||
						location.x - dimensions.width 	> edge.right ||
						location.y + dimensions.height	< edge.top 	 ||
						location.y - dimensions.height	> edge.bottom
					)

					if(!outside){
						var sprite = C('Sprite',entity_id)
						var frame = C('Frame', entity_id)

						if(typeof frame.index != 'undefined'){

							var sourceX = Math.floor(frame.index) * frame.tile_width
							var sourceY = 0
							screen.context
								.drawImage(sprite.image, sourceX, sourceY, frame.tile_width, frame.tile_height,
														location.x, location.y, dimensions.width, dimensions.height )

						} else {
							screen.context
								.drawImage(sprite.image,location.x, location.y, dimensions.width, dimensions.height )
						}
					}
				})
			})
		})
	},

	Landed: function () {
		_.each( C('Collided'), function(collided, id){
			var landed;
			_.each(collided.collisions,function(collision, against_id){
				var response = collision.response
				if(response.overlapN.y && !response.overlapN.x){
					landed = true;
				}
			})
			landed && C('Landed',{},id) && C('RemoveCategory', {name: 'Landed'})
		})
	},
	CancelAction: function(){
		_.each( C('CancelAction'), function(cancel, id){

			var action = C('Action',id)

			action.stack = _.without(action.stack, cancel.action)
			action.value == cancel.action && (
				(action.value = action.stack.pop() )
			)

		})
		C.components.CancelAction && C('RemoveCategory', {name: 'CancelAction'})
	},

	Hidden: function(){
		_.each( C('Hider'), function(hider, entity_id){
			var location = C('Location', entity_id)
			var crouched = C('Action', entity_id).value == 'crouch'
			//todo-james Handle hiding behind objects in a data driven way
			var near = _.any( C('Crate'), function(crate, other_id){
				var crate_location = C('Location',other_id)
				var crate_dimensions = C('Dimensions',other_id)

				var distance = Math.sqrt( Math.pow(crate_location.x - location.x,2) +  Math.pow(crate_location.y - location.y,2))
				var near = distance < crate_dimensions.width * 1.2

				return near

			})
			near && crouched && C('Hidden', {}, entity_id)
		})
		C('RemoveCategory',{name: 'Hidden'})
	},

	Sight: function(){
		_.each( C('See'), function(sightGroups, entity_id){
			_.each(sightGroups, function(componentsToActivate, groupName){
				_.each(C(groupName), function(componentFound, other_id){
					var a = C(entity_id)
					var b = C(other_id)

					if(!b.Hidden){
						var direction = b.Location.x < a.Location.x ? 'left' : 'right'
						var correctDirection = direction == a.Position.value

						var top = b.Location.y - b.Dimensions.height/2
						var bottom = b.Location.y + b.Dimensions.height/2

						var sightY = a.Location.y + a.Sight.offset.y
						var correctHeight = sightY < bottom && sightY > top
						var correctRange = a.Sight.range > Math.abs(b.Location.x - a.Location.x)

						if( correctDirection && correctHeight && correctRange ){
							//todo-james move the sight action to another system,
							//keep detection separate so other systems can make use of sight

							C(componentsToActivate, entity_id)
							C('Target',{ entity: other_id}, entity_id)
						}
					}
				})
			})
		})


	},

	GarbageCollection: function(){
		var screen = C('Screen',1)
		var canvas = screen.canvas
		_.each(C('GarbageCollected'),function(gc, id){
			var camera = C('Camera',1).last_position
				camera.scale = C('Camera',1).scale
			var p = C('Location',id)
			if( Math.abs(p.x-camera.x) > canvas.width/(2 * camera.scale) || Math.abs(p.y-camera.y) > canvas.height/(2 * camera.scale) ){
				C('Remove',{},id)
			}
		})
	},

	//todo-james have an every property maybe...
	Attack: function(){
		_.each( C('Attack'), function(attack, id){
			var target = C('Target', id).entity
			var location = C('Location',id)
			//todo-james Shoot a projectile every frame?
			C({
				Angle: { value: 0 },
				Sprite: { image: s_laser },
				Location: {x: location.x-13, y: location.y + 13},
				Velocity: { x: -10, y: 0 },
				Dimensions: { width: 16, height: 4 },
				//SAT: {},
				//CollidesWith: {},
				Projectile: {},
				Acceleration: { x:0, y:0 },
				GarbageCollected: {}
			})
		})
		C('RemoveCategory', {name: 'Attack'})
	},

	Log: function(){
		_.each( C('Log'), function(log, entity_id){
			console.log(log.message)
		})
		C.components.Log && C('RemoveCategory', {name: 'Log'})
	},

	// If something exists globally add some components to your self
	Has: function(){
		var CategoryAge = C.CategoryAge
		var initial = 1

		_.each( C('Has') , function(is, id){

			_.each(is, function(components, isNames){
				isNames.split('|').forEach(function(isName){

					var self = isName.indexOf('@') > -1
					isName = isName.replace('@','')
					var category = C.components[isName]

					var onSelf = !!(self && category && category[id])
					var onAnyone = !!(category)
					if( onSelf || !self && onAnyone ){

						var age = CategoryAge[isName]

						_.each( components, function(settings, componentName){
							var every = settings.every || 1
							if( (age-initial) % every == 0){
								C(componentName, settings.component, id)
							}
						})
					}
				})

			})
		})
	},

	// If something did exist add some components to your self
	//todo-james don't loop through components, loop through had and check age is -1
	Had: function(){
		var CategoryAge = C.CategoryAge


		_.each( C('Had') , function(had, id){
			_.each(had, function(components, hadNames){
				hadNames.split('|').forEach(function(hadName){

					var self = hadName.indexOf('@') > -1
					hadName = hadName.replace('@','')

					var componentAge = C.ComponentAge[hadName] || {}
					var wasOnSelf = !!(self && componentAge[id])
					var wasOnAnyone = !!(_.max(componentAge))
					if( wasOnSelf || !self && wasOnAnyone ){

						var age = componentAge[id] || _.max(componentAge)

						_.each( components, function(component, componentName){


							if( age == -1){
								C(componentName, component, id*1)
							}
						})
					}
				})

			})
		})
	},

	ComponentAge: function(){
		if (!C.ComponentAge) {
			C.ComponentAge = {}
		}
		for( var category in C.components ){
			C.ComponentAge[category] = C.ComponentAge[category] || {}
			for(var entity in C.components[category]){
				C.ComponentAge[category][entity] = C.ComponentAge[category][entity] || 0
				var recordedAsDead = C.ComponentAge[category][entity] < 0
				if(recordedAsDead){
					C.ComponentAge[category][entity] = 0
				}

				C.ComponentAge[category][entity]++
			}
		}
		for (var category in C.ComponentAge ){
			for( var entity in C.ComponentAge[category]) {
				var entireCategoryEmpty = !C.components[category]
				var componentRemoved = entireCategoryEmpty || !C.components[category][entity]
				var recordedAsAlive = C.ComponentAge[category][entity] > -1
				var ageCategory = C.ComponentAge[category]

				if( entireCategoryEmpty || componentRemoved ) {
					if (recordedAsAlive){
						ageCategory[entity] = 0
					}
					//decrement the removed
					ageCategory[entity]--

					if( ageCategory[entity] < -100){
						//stop tracking
						delete ageCategory[entity]
					}
				}
			}
		}
	},

	CategoryAge: function(){
		if( !C.CategoryAge ){
			C.CategoryAge = {}
		}

		for( var category in C.components ){
			C.CategoryAge[category] = C.CategoryAge[category] || 0
			C.CategoryAge[category]++
		}
		for( var category in C.CategoryAge ){
			if( !C.components[category]) {
				delete C.CategoryAge[category]
			}
		}
	},

	//todo-james Movement functions should migrate to systems/
	Accelerate: function(){
		_.each( C('Accelerate'), function(a, id){
			var A = C('Acceleration',id) || {x:0, y:0}

			if(a.x || a.y){
				a.x && (A.x += a.x)
				a.y && (A.y += a.y)
			} else {

				var angle = a.angle || C('Angle',id).value || 0
				var accelerationRate = C('AccelerationRate',id).value || 1
				A.x += Math.cos(angle) * accelerationRate
				A.y += Math.sin(angle) * accelerationRate
			}
			C('Acceleration',A,id)


		})
		C.components.Accelerate &&C('RemoveCategory', {name: 'Accelerate'})
	},

	Friction: function(){
		_.each( C('Friction'), function(friction, id){
			var velocity = C('Velocity',id)
			velocity.x *= friction.value
			velocity.y *= friction.value
		})
	},

	Move: function(){
		_.each(C('Velocity'), function(velocity, id){
			var location = C('Location',id)
			var acceleration = C('Acceleration',id)

			velocity.x += acceleration.x
			velocity.y += acceleration.y

			acceleration.x = 0
			acceleration.y = 0

			var new_x = location.x + velocity.x
			var new_y = location.y + velocity.y
			var delta = { x: new_x- location.x, y: new_y-location.y }

			var easing = 2
			location.x += delta.x / easing


			location.y += delta.y / easing

		})
	},

	Gravity: function(){
		_.each(C('Gravity'), function(gravity, id){
			var acceleration = C('Acceleration', id)
			acceleration.y += gravity.value
		})
	},

	RemoveComponent: function(){
		_.each( C('RemoveComponent'), function(removeComponent,id){
			delete C.components[removeComponent.name][removeComponent.entity]
		})
		delete C.components.RemoveComponent
	},

	RemoveCategory: function(){
		_.each( C('RemoveCategory'), function(RemoveCategory){
			delete C.components[RemoveCategory.name]
		})
		delete C.components.RemoveCategory
	},

	DeleteEntity: function(){
		_.each( C('Delete'), function( remove, id){

			_.each( _.omit( C(id*1) , remove.omit ) , function(component, key){
				delete C.components[key][id]
			})

		})
	},

}