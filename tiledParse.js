LoadTiles = function(){
  /*
    Quick hack to make loading an image into a promise
    Doesn't handle error case
  */
  function imgLoad(url) {
    return new Promise(function(resolve, reject){
      var img = new Image()
      img.src = url
      img.onload = function(){
        resolve(img)
      }

      if(img.width + img.height>0){

        img.onload()
      }
    })
  }


  /*
    Load the image data onto the tileset, instead of just the path
  */
  var loading = []
  _.each(TileMaps, function(level){
    loading = loading.concat(level.tilesets.map(function(tileset){
      return imgLoad(tileset.image.replace('.','')).then(function(img){
        return tileset.image_data = img
      })
    }))

  })

  return Promise.settle(loading).then(function(){
    /*
      Creates a flat array that associates the tileLayer id with an actual sprite
      so data id == 4, then grab sprites[3]
      date id = 6, then grab sprites[5]
    */
    var tileLayer = TileMaps.small
    tileLayer.sprites = tileLayer.tilesets

    .reduce(function(sprites, tileset, tile_index){

      return sprites.concat(_.times(tileset.imagewidth / tileLayer.tilewidth, function(i){

        var can = document.createElement('canvas')
        var con = can.getContext('2d')
        can.width = tileLayer.tilewidth
        can.height = tileLayer.tileheight

        var source = {
          img: tileset.image_data,
          x: i * tileLayer.tilewidth,
          y: 0,
          width: tileLayer.tilewidth,
          height: tileLayer.tileheight
        }
        var dest = {
          x:0,
          y:0,
          width: source.width,
          height: source.height
        }

        con.drawImage(source.img, source.x,source.y,source.width,source.height,dest.x,dest.y,dest.width,dest.height)
        var img = new Image();
        img.src = can.toDataURL();
        return img
      }))

      return sprites;
    },[])
  })



}