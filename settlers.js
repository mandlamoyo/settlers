STATIC = 0;
ROLLING = 1;
DICE_POS_X = 0;
DICE_POS_Y = 0;
DIE_SIZE = 45;
DIE_COUNT = 2;
DIE_OFFSET = 2;
DIE_ROLL_COUNT = 25;

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

KEY_CODES = {
	32: 'space',
	37: 'left',
	38: 'up',
	39: 'right',
	40: 'down',
}
			
//Creates the array to hold the key codes and sets all their values to false
KEY_STATUS = {};
for( code in KEY_CODES ) {
	KEY_STATUS[ KEY_CODES[ code ]] = false;
}

//Sets up document to listen to onkeydown events
document.onkeydown = function(e) {
	//Firefox and opera use charCode instead of keyCode to return which key was pressed
	var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
	if( KEY_CODES[keyCode] ) {
		e.preventDefault();
		KEY_STATUS[KEY_CODES[keyCode]] = true;
	}
}

//Sets up document to listen to onkeyup events
document.onkeyup = function(e) {
	var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
	if( KEY_CODES[keyCode] ) {
		e.preventDefault();
		KEY_STATUS[KEY_CODES[keyCode]] = false;
	}
}

var imageRepository = new function() {
	this.images = {};
	var numImages = 7;
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
	this.loadImage("die_faces");
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
	this.setInfo = function( type, value ) {
		this.type = type;
		this.value = value;
	}
	
	this.draw = function() {
		var imgType = this.type + "_tile";
		this.context.drawImage( imageRepository.images[imgType], this.x, this.y );
	}
}
Tile.prototype = new Drawable();

function Die() {
	this.setup = function() {
		this.size = DIE_SIZE;
		this.buffer = DIE_OFFSET;
		this.imageCount = 6;
		this.spins = DIE_ROLL_COUNT;
		this.isRolling = false;
		this.animationIndex = 0;
		this.value = -1;
		this.spriteSheet = imageRepository.images["die_faces"];
	};
	
	
	this.roll = function() {
		if ( this.spins == 0 ) {
			this.spins = DIE_ROLL_COUNT;
			this.value = this.animationIndex;
			return true;
			
		} else {
			if ( this.spins % 2 == 0 ) {
				this.animationIndex = Math.floor(Math.random() * (this.imageCount+1));
				if ( this.animationIndex >= this.imageCount ) this.animationIndex = this.imageCount - 1;
				if ( this.animationIndex < 0 ) this.animationIndex = 0;
				this.draw();
			}
			
			this.spins -= 1;
			return false;
		}
	};
	
	/*
	this.updateRoll = function() {
		if ( this.spins == 0 ) {
				this.isRolling = false;
				this.spins = DIE_ROLL_COUNT;
				this.value = this.faceIndex;
				
		} else {
			if ( this.spins % 2 == 0 ) {
				this.animationIndex = Math.floor(Math.random() * (this.imageCount+1));
				if ( this.animationIndex >= this.imageCount ) this.animationIndex = this.imageCount - 1;
				if ( this.animationIndex < 0 ) this.animationIndex = 0;
				this.draw();
			}
			this.spins -= 1;
				
		}
	};
	
	this.roll = function() {
		this.isRolling = true;
		this.value = -1;
	};
	*/
	
	this.getValue = function() {
		return this.value;
	};
		
	this.draw = function() {
		this.context.clearRect( this.x, this.y, this.size, this.size );
		this.context.drawImage( this.spriteSheet, 47*this.animationIndex, 0, 47, this.size, this.x, this.y, this.size, this.size );
	};

}
Die.prototype = new Drawable();

function Dice() {
	this.setup = function( count ) {
		this.numDice = count;
		this.dieOffset = DIE_OFFSET;
		this.state = STATIC;
		this.dieContainer = []
		
		for (  var i=0; i<this.numDice; i++ ) {
			var newDie = new Die();
			newDie.setup();
			newDie.init( this.x + (newDie.size+this.dieOffset)*i, this.y, newDie.size, newDie.size );
			this.dieContainer[i] = newDie;
		}
	};
	
	this.getValue = function() {
		if ( this.state == ROLLING ) return -1;
		
		var sum = 0;
		for ( var i=0; i<this.numDice; i++ ) {
			var value = this.dieContainer[i].getValue();
			if ( value == -1 ) return -1;
			sum += value;
		}
		
		return sum + 2; // + 2 because die value ranges from 0-5 rather than 1-6
	};
	
	this.updateRoll = function() {
		var finished = 0;
		for ( var i=0; i<this.numDice; i++ ) {
			res = this.dieContainer[i].roll();
			if ( res == true ) finished++;
		}
		
		if ( finished == this.numDice ) {
			this.state = STATIC;
			console.log( this.getValue() );
		}
	};
	
	this.roll = function() {
		this.state = ROLLING;	
	};
	
	this.draw = function() {
		for ( var i=0; i<this.numDice; i++ ) {
			this.dieContainer[i].draw();
		}
	};
}
Dice.prototype = new Drawable();

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
                        
						Die.prototype.context = this.bgContext;
                        Die.prototype.canvasWidth = this.bgCanvas.width;
                        Die.prototype.canvasHeight = this.bgCanvas.height;
						
						Dice.prototype.context = this.bgContext;
                        Dice.prototype.canvasWidth = this.bgCanvas.width;
                        Dice.prototype.canvasHeight = this.bgCanvas.height;

                        this.tiles = []
                        var adj = [0,1,2,1,0];
                        var yInc = 7;
                        var s = 0; //row?
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
                                        this.tiles[j][i].setInfo( type, i );
                                        var xpos = Math.floor( origin[0] + (imageRepository.images[tImg].width * i) - (imageRepository.images[tImg].width/2)*adj[j] );
                                        var ypos = Math.floor( origin[1] + yInc*s + (imageRepository.images[tImg].height/3)*2*j );
                                        //alert( xpos + ", " + ypos );
                                        this.tiles[j][i].init( xpos, ypos, imageRepository.images[tImg].width, imageRepository.images[tImg].height );
                                }
                                s++;
                        }
						
						this.dice = new Dice();
						
						this.dice.init( DICE_POS_X, DICE_POS_Y, (DIE_SIZE + DIE_OFFSET) * DIE_COUNT, DIE_SIZE );
						this.dice.setup( DIE_COUNT );
						/*
						for ( var j=0; j<DIE_COUNT; j++ ) {
							this.dice[j] = new Dice();
							this.dice[j].setup();
						}
						*/
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
				
				this.dice.draw();
				this.dice.roll();
				/*
				for ( var j=0; j<DIE_COUNT; j++ ) {
					this.dice[j].draw();
					this.dice[j].roll();
				}*/
				animate();
        };
		
}

function animate() {
        requestAnimFrame( animate );
		
		//Update dice
		
		switch( game.dice.state ) {
			case STATIC:
				if ( KEY_STATUS.space ) game.dice.roll();
				break;
			
			case ROLLING:
				game.dice.updateRoll();
				break;
		}
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
