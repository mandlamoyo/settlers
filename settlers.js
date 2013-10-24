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

var types = ["wheat", "ore", "sheep", "wood", "brick", "desert"];
shuffle( types );

function Game() {
        this.init = function() {
                this.bgCanvas = document.getElementById('background');
                
                if( this.bgCanvas.getContext ) {
                        this.bgContext = this.bgCanvas.getContext('2d');
                        
                        Tile.prototype.context = this.bgContext;
                        Tile.prototype.canvasWidth = this.bgCanvas.width;
                        Tile.prototype.canvasHeight = this.bgCanvas.height;
                        
                        this.tiles = []
                        for( var i=0; i<5; i++ ) {
                                var type = types[i%types.length]
                                var tImg = type + "_tile";
                                this.tiles[i] = new Tile();
                                this.tiles[i].set( type, i );
                                this.tiles[i].init( 0+imageRepository.images[tImg].width*i, 0+10*i, imageRepository.images[tImg].width, imageRepository.images[tImg].height );
                        }
                        
                        return true;
                } else {
                        return false;
                }
        };       
        
        this.start = function() {
                for( var i=0; i<this.tiles.length; i++ ) {
                        this.tiles[i].draw();
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