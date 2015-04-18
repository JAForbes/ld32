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

	DrawSprites: function(){

		_.each(C('DrawOrder'), function(drawOrder, id){
			var screen = C('Screen',id)
			drawOrder.groups.forEach(function(group){
				_.each(C(group), function(someComponent, entity_id){
					var sprite = C('Sprite',entity_id)
					var location = C('Location',entity_id)
					var dimensions = C('Dimensions',entity_id)

					screen.context
						.drawImage(sprite.image, location.x, location.y, dimensions.width, dimensions.height)

				})
			})
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

			location.x += velocity.x
			location.y += velocity.y
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