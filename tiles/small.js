(function(name,data){
 if(typeof onTileMapLoaded === 'undefined') {
  if(typeof TileMaps === 'undefined') TileMaps = {};
  TileMaps[name] = data;
 } else {
  onTileMapLoaded(name,data);
 }})("small",
{ "height":10,
 "layers":[
        {
         "data":[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 24, 24, 24, 24, 24, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 2, 0, 0, 0, 0, 0, 0, 5, 0, 16, 0, 0, 0, 0, 0, 0, 0, 4, 1, 1, 2, 0, 0, 0, 0, 0, 8, 0, 12, 1, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
         "height":10,
         "name":"Tile Layer 1",
         "opacity":1,
         "type":"tilelayer",
         "visible":true,
         "width":10,
         "x":0,
         "y":0
        }],
 "nextobjectid":1,
 "orientation":"orthogonal",
 "properties":
    {

    },
 "renderorder":"right-down",
 "tileheight":16,
 "tilesets":[
        {
         "firstgid":1,
         "image":"..\/img\/terrain.png",
         "imageheight":16,
         "imagewidth":256,
         "margin":0,
         "name":"terrain",
         "properties":
            {

            },
         "spacing":0,
         "tileheight":16,
         "tilewidth":16
        }, 
        {
         "firstgid":17,
         "image":"..\/img\/terrain2.png",
         "imageheight":16,
         "imagewidth":256,
         "margin":0,
         "name":"terrain2",
         "properties":
            {

            },
         "spacing":0,
         "tileheight":16,
         "tilewidth":16
        }],
 "tilewidth":16,
 "version":1,
 "width":10
});