systems = {
	Screen: function(){
		_.each(C('Screen'), function(screen, id){
			screen.canvas.width = screen.ratio * window.innerWidth
			screen.canvas.height = screen.ratio * window.innerHeight
			screen.context.scale(screen.scale,screen.scale)
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

			if(frame.index > finalIndex){
				if(frame.repeat){
					frame.index = 0
				} else {
					frame.index = finalIndex
				}
			}
		})
	},

	DrawSprites: function(){

		_.each(C('DrawOrder'), function(drawOrder, id){
			var screen = C('Screen',id)
			drawOrder.groups.forEach(function(group){
				_.each(C(group), function(someComponent, entity_id){
					var sprite = C('Sprite',entity_id)
					var location = C('Location',entity_id)
					var dimensions = C('Dimensions',entity_id)
					var frame = C('Frame', entity_id)

					if(typeof frame.index != 'undefined'){
						var sourceX = Math.floor(frame.index) * frame.tile_width
						var sourceY = 0
						screen.context
							.drawImage(sprite.image, sourceX, sourceY, frame.tile_width, frame.tile_height, location.x, location.y, dimensions.width, dimensions.height )

					} else {
						screen.context
							.drawImage(sprite.image, location.x, location.y, dimensions.width, dimensions.height)
					}
				})
			})
		})
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

	ComponentAge: function(){
		if (!C.ComponentAge) {
			C.ComponentAge = {}
		}
		for( var category in C.components ){
			C.ComponentAge[category] = C.ComponentAge[category] || {}
			for(var entity in C.components[category]){
				C.ComponentAge[category][entity] = C.ComponentAge[category][entity] || 0
				C.ComponentAge[category][entity]++
			}
		}
		for (var category in C.ComponentAge ){
			for( var entity in C.ComponentAge[category]) {
				if( !C.components[category]  || !C.components[category][entity] ) {
					if (C.ComponentAge[category][entity] > -1){
						C.ComponentAge[category][entity] = 0
					}
					C.ComponentAge[category][entity]--
					if( C.ComponentAge[category][entity] < -100){
						delete C.ComponentAge[category][entity]
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