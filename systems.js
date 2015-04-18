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
			level.layers.forEach(function(mapName){
				var tileLayer = C('TileMaps', level.game)[mapName]
				var con = C('Screen',level.game).context


				tileLayer.layers.forEach(function(layer){
					var tile_data = layer.data.reduce(function(data, id, i){
					  if(id){
					    data.push({
					       x: i % 10 * tileLayer.tilewidth,
					       y: Math.floor(i / 10)* tileLayer.tileheight,
					       id: id
					    })
					  }
					  return data;
					},[])

					tile_data.forEach(function(tile){
						var sourceImage = tileLayer.sprites[tile.id-1]
						var sourceX = 0;
						var sourceY = 0;
						var tileWidth = tileLayer.tilewidth;
						var tileHeight = tileLayer.tileheight;
						var dest_width = tileLayer.tilewidth;
						var dest_height = tileLayer.tileheight;

						con.drawImage(
							sourceImage, sourceX, sourceY, tileWidth, tileHeight,
							tile.x, tile.y, dest_width, dest_height
						)

					})
				})
			})


		})
	}
}