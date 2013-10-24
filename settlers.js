var game = new Game();

function init() {
        if( game.init() ) game.start();
}

function shuffle(array) {
    var counter = array.length, temp, index;

    // While there are elements in the array
    while (counter--) {
        // Pick a random index
        index = (Math.random() * counter) | 0;

        // And swap the last element with it
        temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}

var imageRepository = new function() {
        this.images = {};
        var numImages = 6;
        var numLoaded = 0;
        
        this.loadImage = function( name ) {
                this.images[name] = new Image();
                this.images[name].onload = function() {
                        numLoaded++;
                        if( numLoaded === numImages ) {
                                window.init();
                        }
                }
                this.images[name].src = "images/" + name + ".png";
        }
        
        this.loadImage("wheat_tile");
        this.loadImage("ore_tile");
        this.loadImage("brick_tile");
        this.loadImage("sheep_tile");
        this.loadImage("wood_tile");
        this.loadImage("desert_tile");
}

function Drawable() {
        this.init = function( x, y, width, height ) {
                this.x = x;
                this.y = y;
                this.width = width;
                this.height = height;
        }
        
        this.canvasWidth = 0;
        this.canvasHeight = 0;
        
        this.draw = function() {
        };
}

function Tile() {
        this.set = function( type, value ) {
                this.type = type;
                this.value = value;
        }
        
        this.draw = function() {
                var imgType = this.type + "_tile";
                this.context.drawImage( imageRepository.images[imgType], this.x, this.y );
        }
}
Tile.prototype = new Drawable();

var types = [];
for( var i=0; i<4; i++ ) {
        if( i < 3 ) {
                types.push("ore");
                types.push("brick");
        }
        types.push("wheat");
        types.push("sheep");
        types.push("wood");
        
}
types.push("desert");
shuffle( types );

var origin = [0,0];
var tW = imageRepository.images["wheat_tile"].width;
var tH = imageRepository.images["wheat_tile"].height;



function Game() {
        this.init = function() {
                this.bgCanvas = document.getElementById('background');
                
                if( this.bgCanvas.getContext ) {
                        this.bgContext = this.bgCanvas.getContext('2d');
                        
                        Tile.prototype.context = this.bgContext;
                        Tile.prototype.canvasWidth = this.bgCanvas.width;
                        Tile.prototype.canvasHeight = this.bgCanvas.height;
                        
                        this.tiles = []
                        var adj = [0,1,2,1,0];
                        var yInc = 7;
                        var s = 0;
                        var pos = [3,4,5,4,3];
                        var origin = [this.bgCanvas.width/2 - imageRepository.images["wheat_tile"].width*1.5,this.bgCanvas.height/6];
                        //alert( origin );
                        for( var j=0; j<pos.length; j++ ) {
                                this.tiles[j] = [];
                                
                                for( var i=0; i<pos[j]; i++ ) { 
                                        //var type = types[(i+j)%types.length];
                                        var type = types.pop();
                                        var tImg = type + "_tile";
                                                
                                        this.tiles[j][i] = new Tile();
                                        this.tiles[j][i].set( type, i );
                                        var xpos = Math.floor( origin[0] + (imageRepository.images[tImg].width * i) - (imageRepository.images[tImg].width/2)*adj[j] );
                                        var ypos = Math.floor( origin[1] + yInc*s + (imageRepository.images[tImg].height/3)*2*j );
                                        //alert( xpos + ", " + ypos );
                                        this.tiles[j][i].init( xpos, ypos, imageRepository.images[tImg].width, imageRepository.images[tImg].height );
                                }
                                s++;
                        }
                        
                        return true;
                } else {
                        return false;
                }
        };       
        
        this.start = function() {
                for( var j=0; j<this.tiles.length; j++ ) {
                        for( var i=0; i<this.tiles[j].length; i++ ) {
                                if( this.tiles[j][i] != 0 )
                                        this.tiles[j][i].draw();
                        }
                }
        };
}

function animate() {
        requestAnimFrame( animate );
}

window.requestAnimFrame = (function() {
        return window.requestAnimationFrame     ||
                window.webkitRequestAnimationFrame      ||
                window.mozRequestAnimationFrame         ||
                window.oRequestAnimationFrame           ||
                window.msRequestAnimationFrame          ||
                function( /* function */ callback, /* DOMelement */ element ) {
                        window.setTimeout( callback, 1000/60 );
                };
})();