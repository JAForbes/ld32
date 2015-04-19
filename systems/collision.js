//Separating Axis Theorem - Collision Detection
systems.SAT = function(){
	var processed = {}
	_.each(C('CollidesWith'), function(collidesWith,a){
	_.each(collidesWith.entities, function(relevant,b){
		if( a != b && !processed[a+':'+b]) {
			processed[b+':'+a] = true
			var satA = C('SAT',a)
			var satB = C('SAT',b)
			var response = new SAT.Response()


			var collided = SAT.testPolygonPolygon(
				satA.box.toPolygon(),
				satB.box.toPolygon(),
				response
			) && response


			if(collided){

				var aCollided = C('Collided',a)
				;(aCollided.collisions = aCollided.collisions || {})[b] = { response: response }
				;(C.components.Collided = C.components.Collided || {})[a] = aCollided


				var bCaresAbout = C('CollidesWith',b) || { entities: {}}
				var bCaresAboutA = bCaresAbout.entities[a]
				if( bCaresAboutA ){
					var bCollided = C('Collided',b)
					;(C.components.Collided = C.components.Collided || {})[b] = bCollided
					;(bCollided.collisions = bCollided.collisions || {})[a] = {}
				}
			}
		}
	})
	})
	if( C.components.Collided ) {
		C('RemoveCategory',{name: 'Collided'})
	}
}


systems.SAT_sync = function(){
	_.each(C('SATSync'),function(satSync,id){
		var sat = C('SAT',id)
		sat.box = new SAT.Box()


		var d = C('Dimensions',id)

		sat.box.pos = C('Location',id)
		sat.box.w = d.width
		sat.box.h = d.height
	})
}

/*
	Creates a list of entities that are relevant to collision detection.

	Based on the types specified in the CollidesWith component
*/
systems.CollidesWith = function(){

	_.each(C('CollidesWith'), function(collidesWith, id){

		collidesWith.entities = {}
		relevant = collidesWith.entities

		_.each(collidesWith, function(componentsToAdd,threatName){
			_.each(C(threatName), function( component, against_id){
				relevant[against_id] = true
			})
			return relevant;
		})
	})
}

//Adds components to an entity, if it has collided with a particular type.
//The types are specified in CollidesWith

systems.Vulnerable = function(){

	var triggerCollisionComponents = function(entity_id, against_id, componentsToAdd, against_type){
		if(against_type == 'entities') return;

		var collidedWithThreat = C.components[against_type] && C.components[against_type][against_id]
	 	if(collidedWithThreat){
	 		_.each(componentsToAdd, function(component, componentName){
				C(componentName,component,entity_id)
			})
	 	}
	}


	_.each(C('Collided'), function(collided,id){
		_.each(collided.collisions, function(collision, against){
			var trigger = triggerCollisionComponents.bind(null, id, against)
			 _.each(C('CollidesWith',id), trigger )
		})
	})
}

//todo-james Perhaps have an onground flag to save calculations.
systems.Uncollide = function(){
	_.each(C('Uncollide'), function(uncollide, id){
		var location = C('Location',id)
		var acceleration = C('Acceleration',id)
		var velocity = C('Velocity',id)
		var oldV = {x: velocity.x, y: velocity.y }
		var oldA = {x: acceleration.x, y: acceleration.y }

		var largestResponse = {
			overlapV: {x:0, y:0},
			overlap: 0
		};

		_.each(C('Collided', id).collisions, function(collision,against){

			var overlapN = collision.response.overlapN
			var overlapV = collision.response.overlapV


			if(overlapN.y){
				acceleration.y = velocity.y = 0
			}
			if(overlapN.x){
				acceleration.x = velocity.x = 0
			}


			if(collision.response.overlap > largestResponse.overlap){
				largestResponse = collision.response
			}


		})

		var overlapV = largestResponse.overlapV
		//todo-james If two entities collide precisely on the corner the overlap won't resolve properely, hence the 1e-4
		location.x -= overlapV.x > 0 ? overlapV.x + 1e-4 : overlapV.x -1e-4
		location.y -= overlapV.y > 0 ? overlapV.y + 1e-4 : overlapV.y -1e-4

	})
	C.components.Uncollide && C('RemoveCategory', {name: 'Uncollide'})
}