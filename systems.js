systems = {
	Screen: function(){
		_.each(C('Screen'), function(screen, id){
			screen.canvas.width = screen.ratio * window.innerWidth
			screen.canvas.height = screen.ratio * window.innerHeight
		})
	},

	/*
		Not a fan of Tiled's data format.  But it is what it is...
	*/
	DrawLevel: function(){
		_.each(C('Level'), function(level, id){
			level.layers.forEach(function(levelName){
				var tileLayer = C('TileMaps', level.game)[levelName]
				var con = C('Screen',level.game).context


				var map = TileMaps.small
				var tileset = map.tilesets[0]
				var tile_data = map

					.layers[0].data

					.reduce(function(data, id, i){
					  if(id){
					    data.push({
					       x: i % 10 * map.tilewidth,
					       y: Math.floor(i / 10)* map.tileheight,
					       id: id
					    })
					  }
					  return data;
					},[])


				tile_data.forEach(function(tile){
					var img = tileLayer.tilesets[0].image_data
					con.drawImage(
						//sourceImage
						img,
						//sourceX
						id*map.tilewidth,
						//sourceY
						0,
						//tileWidth
						map.tilewidth,
						//tileHeight
						map.tileheight,
						//canvas x
						tile.x,
						//canvas y
						tile.y,
						map.tilewidth,
						map.tileheight
					)
				})

			})


		})
	}
}