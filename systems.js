systems = {
	Screen: function(){
		_.each(C('Screen'), function(screen, id){
			screen.canvas.width = screen.ratio * window.innerWidth
			screen.canvas.height = screen.ratio * window.innerHeight
		})
	},

	DrawTiles: function(){
		_.each(C('TileLayers'), function(tileLayers, id){
			var con = C('Screen',id).context
			con.drawImage(tileLayers.Tiled.small.tilesets[0].image_data,0,0)
		})
	}
}