export const jackCode = [
	{
		name: 'Blank',
		description:
			'Write your own program in Jack! The entire standard library as described in Nand to Tetris is supported. Multiple classes can be included in the editor in a single file instead of having separate files. Clicking on a different preset will overwrite any edits, so copy and save your code locally if you want to retain it.',
		code: 'Write your own Jack program here!'
	},
	{
		name: 'Average',
		description:
			'Average calculator by Nisan and Schocken. Calculates the 16 bit integer average of an arbitrary number of 16 bit integers.',
		code: `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/11/Average/Main.jack

// Inputs some numbers and computes their average
class Main {
   function void main() {
      var Array a; 
      var int length;
      var int i, sum;

      let length = Keyboard.readInt("How many numbers? ");
      let a = Array.new(length); // constructs the array
      
      let i = 0;
      while (i < length) {
         let a[i] = Keyboard.readInt("Enter a number: ");
         let sum = sum + a[i];
         let i = i + 1;
      }
      
      do Output.printString("The average is ");
      do Output.printInt(sum / length);
      return;
   }
}
      `
	},
	{
		name: 'Square',
		description:
			'Square Dance game by Nisan and Schocken. Use the arrow keys to move the square, Z to decrease size and X to increase size and Q to quit.',
		code: `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/11/Square/Main.jack

// (same as projects/09/Square/Main.jack)

/** Initializes a new Square Dance game and starts running it. */
class Main {
      function void main() {
         var SquareGame game;
         let game = SquareGame.new();
         do game.run();
         do game.dispose();
         return;
      }
}

// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/11/Square/Square.jack

// (same as projects/09/Square/Square.jack)

/** Implements a graphical square. */
class Square {

   field int x, y; // screen location of the square's top-left corner
   field int size; // length of this square, in pixels

   /** Constructs a new square with a given location and size. */
   constructor Square new(int Ax, int Ay, int Asize) {
      let x = Ax;
      let y = Ay;
      let size = Asize;
      do draw();
      return this;
   }

   /** Disposes this square. */
   method void dispose() {
      do Memory.deAlloc(this);
      return;
   }

   /** Draws the square on the screen. */
   method void draw() {
      do Screen.setColor(true);
      do Screen.drawRectangle(x, y, x + size, y + size);
      return;
   }

   /** Erases the square from the screen. */
   method void erase() {
      do Screen.setColor(false);
      do Screen.drawRectangle(x, y, x + size, y + size);
      return;
   }

      /** Increments the square size by 2 pixels. */
   method void incSize() {
      if (((y + size) < 254) & ((x + size) < 510)) {
         do erase();
         let size = size + 2;
         do draw();
      }
      return;
   }

   /** Decrements the square size by 2 pixels. */
   method void decSize() {
      if (size > 2) {
         do erase();
         let size = size - 2;
         do draw();
      }
      return;
   }

   /** Moves the square up by 2 pixels. */
   method void moveUp() {
      if (y > 1) {
         do Screen.setColor(false);
         do Screen.drawRectangle(x, (y + size) - 1, x + size, y + size);
         let y = y - 2;
         do Screen.setColor(true);
         do Screen.drawRectangle(x, y, x + size, y + 1);
      }
      return;
   }

   /** Moves the square down by 2 pixels. */
   method void moveDown() {
      if ((y + size) < 254) {
         do Screen.setColor(false);
         do Screen.drawRectangle(x, y, x + size, y + 1);
         let y = y + 2;
         do Screen.setColor(true);
         do Screen.drawRectangle(x, (y + size) - 1, x + size, y + size);
      }
      return;
   }

   /** Moves the square left by 2 pixels. */
   method void moveLeft() {
      if (x > 1) {
         do Screen.setColor(false);
         do Screen.drawRectangle((x + size) - 1, y, x + size, y + size);
         let x = x - 2;
         do Screen.setColor(true);
         do Screen.drawRectangle(x, y, x + 1, y + size);
      }
      return;
   }

   /** Moves the square right by 2 pixels. */
   method void moveRight() {
      if ((x + size) < 510) {
         do Screen.setColor(false);
         do Screen.drawRectangle(x, y, x + 1, y + size);
         let x = x + 2;
         do Screen.setColor(true);
         do Screen.drawRectangle((x + size) - 1, y, x + size, y + size);
      }
      return;
   }
}

// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/11/Square/SquareGame.jack

// (same as projects/09/Square/SquareGame.jack)

/**
 * Implements the Square Dance game.
 * This simple game allows the user to move a black square around
 * the screen, and change the square's size during the movement.
 * When the game starts, a square of 30 by 30 pixels is shown at the
 * top-left corner of the screen. The user controls the square as follows.
 * The 4 arrow keys are used to move the square up, down, left, and right.
 * The 'z' and 'x' keys are used, respectively, to decrement and increment
 * the square's size. The 'q' key is used to quit the game.
 */

class SquareGame {
   field Square square; // the square of this game
   field int direction; // the square's current direction: 
                        // 0=none, 1=up, 2=down, 3=left, 4=right

   /** Constructs a new Square Game. */
   constructor SquareGame new() {
      // Creates a 30 by 30 pixels square and positions it at the top-left
      // of the screen.
      let square = Square.new(0, 0, 30);
      let direction = 0;  // initial state is no movement
      return this;
   }

   /** Disposes this game. */
   method void dispose() {
      do square.dispose();
      do Memory.deAlloc(this);
      return;
   }

   /** Moves the square in the current direction. */
   method void moveSquare() {
      if (direction = 1) { do square.moveUp(); }
      if (direction = 2) { do square.moveDown(); }
      if (direction = 3) { do square.moveLeft(); }
      if (direction = 4) { do square.moveRight(); }
      do Sys.wait(5);  // delays the next movement
      return;
   }

   /** Runs the game: handles the user's inputs and moves the square accordingly */
   method void run() {
      var char key;  // the key currently pressed by the user
      var boolean exit;
      let exit = false;
      
      while (~exit) {
         // waits for a key to be pressed
         while (key = 0) {
            let key = Keyboard.keyPressed();
            do moveSquare();
         }
         if (key = 81)  { let exit = true; }     // q key
         if (key = 90)  { do square.decSize(); } // z key
         if (key = 88)  { do square.incSize(); } // x key
         if (key = 131) { let direction = 1; }   // up arrow
         if (key = 133) { let direction = 2; }   // down arrow
         if (key = 130) { let direction = 3; }   // left arrow
         if (key = 132) { let direction = 4; }   // right arrow

         // waits for the key to be released
         while (~(key = 0)) {
            let key = Keyboard.keyPressed();
            do moveSquare();
         }
      } // while
      return;
   }
}
   `
	},
	{
		name: 'Snake',
		description:
			'Classic Snake game written by me! Use the arrow keys to change the direction of the snake and collect the apples. The part of this that I am most proud of is the tiny linear congruential generator random number generator that I designed to handle the placement of the apples.',
		code: `/** Intializes the Snake and start running the game */
class Main {
   function void main() {
      var SnakeGame game;
      var int seedCount;
      var int key;
      let seedCount = 1;
      // set message
      do Output.moveCursor(10, 20);
      do Output.printString("Press any key to start");
      while (key = 0) {
         let key = Keyboard.keyPressed();
         // count modulo m - 1 to set seed
         if (seedCount = (1499 - 1)) {
            let seedCount = 1;
         }
         let seedCount = seedCount + 1;
      }
      // delete message
      do Output.moveCursor(10, 20);
      do Output.printString("                         ");
      // start game
      let game = SnakeGame.new(seedCount);
      do game.run();
      do game.dispose();
      return;
   }
}

class Mod {
   function int mod(int a, int b) {
      /** Only defined for a > 0, b > 0*/
      // for a/b, (a/b)*b + a%b = a
      var int result;
      let result = a - ((a / b ) * b);
      return result;
   }
}

class Random {
   field int m;
   field int a;
   field int seed;
   
   // implement as a Lehmer RNG
   // seed must be coprime to m to avoid poor behavior
   // take m = 1499, a = 19. This gives a cycle of 1498
   
   constructor Random new(int newSeed) {
      let seed = newSeed;
      let m = 1499;
      let a = 19;
      return this;
   }
   
   method int randomRange(int max) {
      var int value;
      let value = random();
      return Mod.mod(value, max); 
   }
   
   method int random() {
      let seed = Mod.mod(a * seed, m);
      return seed;
   }
}

// The pieces of the snake, implemented as a reverse singly-linked listt
// (liked from tail to head) 
// New segments get added at the head and removed at the tail

class Segment {
  field int x, y;
  field Segment prev;

  constructor Segment new(int Lx, int Ly) {
    let x = Lx;
    let y = Ly;
    let prev = null;
    return this;
  }

  /** getters */
  method int getX() { return x; }
  method int getY() { return y; }
  method Segment getPrev() { return prev; }
  method void setPrev(Segment prevSeg) {
    let prev = prevSeg; 
    return;
  }

  method void draw(int size) {
    do Screen.setColor(true);
    do Screen.drawRectangle(x+1, y+1, x + size-1, y + size-1);
    return;
  }

  method void erase(int size) {
    do Screen.setColor(false);
    do Screen.drawRectangle(x+1, y+1, x + size-1, y + size-1);
    return;
  }

  method void dispose() {
    do Memory.deAlloc(this);
    return;
  }
}

// Represents the user-controlled snake object
// Needs to have a direction and a length
// Also controls the rendering of the snake and intersection behaviour

/** Implements a snake for the game snake
The snake has 4 movement directions
Can cross across the borders of the screen
It is able to grow
And it dies if it intersects itself

An interesting problem is setting this up so that the time at each step
stays the same even as the snake gets longer! We need to set up the snake so that 
as many operations as possible are constant time, otherwise the game will slow down
as the snake gets longer. This is relatively easy to do
when drawing the snake, but is harder when checking for intersection.
To make intersection checks constant time, a hash table would have to be used.
*/
class Snake {
  field Segment head; // head of the snake, poiting to null
  field Segment tail; // tail of the snake, pointing to a Segment towards the head
  field SnakeBoard board; // a board for the snake to live on
  field int gridSize; // size of a block of the snake
  /** Constructs a new snake and a board for the snake*/
  constructor Snake new(int height, int width, int hoffset, int woffset, int gameGridSize, int rand) {
    let gridSize = gameGridSize;
    // spawn in a new board
    let board = SnakeBoard.new(gridSize, height, width, hoffset, woffset, rand);
    // draw board
    do board.setBoard();
    // spawn in two new segments at the center of the array
    let head = Segment.new(board.getX(594), board.getY(594));
    let tail = Segment.new(board.getX(593), board.getY(593));
    // set prev pointer from tail to head
    do tail.setPrev(head);
    // draw both segments
    do head.draw(gridSize);
    do tail.draw(gridSize);
    // create the apple
    do board.makeApple();
    return this;
  }

  method void step(int direction, boolean grow) {
    var int new_x, new_y;
    var Segment newSeg;
    var Segment tempSeg;
    var Segment next;
    // 1. get coordinates of new segment
    if (direction = 1) { let new_x = head.getX(); let new_y = head.getY() - gridSize; }
    if (direction = 2) { let new_x = head.getX() + gridSize; let new_y = head.getY(); }
    if (direction = 3) { let new_x = head.getX(); let new_y = head.getY() + gridSize; }
    if (direction = 4) { let new_x = head.getX() - gridSize; let new_y = head.getY(); }
    // 2. check for intersection and end game if detected
    if (board.getBoardVal(new_x, new_y) = 1) {
      do gameOver();
    }
    // 3. add a new segment to the front and draw it
    let newSeg = Segment.new(new_x, new_y);
    do head.setPrev(newSeg);
    let head = newSeg;
    do head.draw(gridSize);   
    // 4. if we eat an apple, the snake will grow, otherwise dispose the tail
    if (~(board.getBoardVal(new_x, new_y) = 2)) {
      do board.setBoardVal(tail.getX(), tail.getY(), 0);
      do tail.erase(gridSize);
      let tempSeg = tail.getPrev();
      do tail.dispose();
      let tail = tempSeg;
    } else {
    // we got an apple! Reset the board value and make a new apple
      // do Output.printString("yum!");
      // this function needs to check that the board value is not 1 when an apple is being made
      do board.makeApple();
      do board.drawScore(1);
    }
    // set Board val to 1 at the end
    do board.setBoardVal(new_x, new_y, 1);
    do Sys.wait(100);
    return;
  }

  method void gameOver() {
    do Output.moveCursor(10, 22);
    do Output.printString("Game Over");
    do Sys.halt();
    return;
  }

  /** dispose recursively starting with tail */
  method void dispose() {
    var Segment prevTail;
    if (~(tail.getPrev() = null)) {
      let prevTail = tail.getPrev();
      do prevTail.dispose();
    }
    do Memory.deAlloc(this);
    return;
  }

}
  
class SnakeBoard {
   field Array board;
   field int cellsWidth, cellsHeight;
   field int arraySize;
   field int gridSize;
   field int x_offset;
   field int y_offset;
   field int max_x;
   field int min_x;
   field int max_y;
   field int min_y;
   field Random randx;
   field Random randy;
   field int score;
 
   constructor SnakeBoard new(int gridSizeIn, int heightIn, int widthIn, int yoffset, int xoffset, int rand) {
   
     let x_offset = xoffset;
     let y_offset = yoffset;
     let gridSize = gridSizeIn;
     let min_x = x_offset;
     let min_y = y_offset;
     let max_x = (x_offset + widthIn) - gridSize;
     let max_y = (y_offset + heightIn) - gridSize;
     // Build an array to hold the cells of the gameboard
     let cellsWidth = widthIn / gridSize;
     //do Output.printInt(cellsWidth);
     let cellsHeight = heightIn / gridSize;
     //do Output.printInt(cellsHeight);
     let arraySize = cellsWidth * cellsHeight;
     let board = Array.new(arraySize);
 
     let randx = Random.new(rand);
     let randy = Random.new(rand);
 
     let score = 0;
     do drawScore(0);
     //do Output.printInt(arraySize);
     return this;
   }
 
   method void drawScore(int add) {
     let score = score + add;
     do Output.moveCursor(20, 50);
     do Output.printString("Score:");
     do Output.printInt(score);
     return;
   }
 
   method void setBoard() {
     //set initial board: 0 is a regular square, 1 is a boundary or a snake, 2 is the apple
     var int i, j, x, y;
     let i = 0;
     /*
     do Screen.setColor(true);
 
     // draw solid block
     do Screen.drawRectangle(min_x, min_y, max_x, max_y);
     // draw black blocks in grid pattern, leaving dots and border
     do Screen.setColor(false);
     while (i < cellsWidth) {
        do Screen.drawRectangle(min_x + (i * gridSize), min_y + gridSize, min_x + (i * gridSize) + gridSize - 1, max_y - gridSize);
        let i = i+1;
     } 
     let i = 0;
     while (i < cellsHeight) {
        do Screen.drawRectangle(min_x + gridSize, min_y + (i * gridSize), max_x - gridSize, min_y + (i * gridSize) + gridSize - 1);
        let i = i+1;
     } 
     do Screen.setColor(true);
     */
 
     // what if we skip the 4 condition if?
     do Screen.setColor(true);
     // top edge
     let i = 0;
     while (i < cellsWidth) {
       let board[i] = 1;
       do Screen.drawRectangle(min_x + (i * gridSize) + 1, min_y + 1, min_x + ((i+1) * gridSize) - 1, min_y + gridSize - 1);
       let i = i + 1;
     }
     // bottom edge
     let i = 0;
     while (i < cellsWidth) {
       let board[((cellsHeight - 1) * cellsWidth) + i] = 1;
       do Screen.drawRectangle(min_x + (i * gridSize) + 1, max_y + 1, min_x + ((i+1) * gridSize) - 1, max_y + gridSize - 1);
       let i = i + 1;
     }
     // left edge
     let i = 1;
     while (i < (cellsHeight - 1)) {
       let board[i * cellsWidth] = 1;
       do Screen.drawRectangle(min_x + 1, min_y + (i * gridSize) + 1, min_x + gridSize - 1, min_y + ((i+1) * gridSize) - 1);
       let i = i + 1;
     }
 
     // right edge
     let i = 1;
     while (i < (cellsHeight - 1)) {
       let board[i * cellsWidth + cellsWidth - 1] = 1;
       do Screen.drawRectangle(max_x + 1, min_y + (i * gridSize) + 1, max_x + gridSize - 1, min_y + ((i+1) * gridSize) - 1);
       let i = i + 1;
     }
 
     /*
     // old way of drawing screen
     do Screen.setColor(true);
     while (i < arraySize) {
       let x = getX(i);
       let y = getY(i);
       // draw boundaries and set board values at boundaries
       if ((x = min_x) | (x = max_x) | (y = min_y) | (y = max_y)) {
         let board[i] = 1;
         do Screen.drawRectangle(x + 1, y + 1, x + gridSize - 1, y + gridSize - 1);
       } else {
         let board[i] = 0;
         do Screen.drawPixel(x ,y);
       }
       let i = i+1;
     }
     */
     return;
   }
 
   method int getBoardVal(int x, int y) {
     return board[getI(x, y)];
   }
 
   method void setBoardVal(int x, int y, int value) {
     let board[getI(x, y)] = value;
     return;
   }
 
   method void makeApple() {
     var int x_cell, y_cell, i, x, y;
     let x_cell = randx.randomRange(cellsWidth);
     let y_cell = randy.randomRange(cellsHeight);
     let i = (y_cell * cellsWidth) + x_cell;
     let x = getX(i);
     let y = getY(i);
     // if we try making an apple outside valid spots, try again
     if (getBoardVal(x, y) = 0) {
       do setBoardVal(x, y, 2);
       do Screen.drawCircle(x + (gridSize / 2), y + (gridSize / 2), gridSize / 3);
     } else {
       do makeApple();
     }
     return;
   }
 
   method int getX(int i) {
     var int x, y;
     let y = i / cellsWidth;
     let x = i - (cellsWidth * y);
     return (x * gridSize) + x_offset;
   }
 
   method int getY(int i) {
     var int y;
     let y = i / cellsWidth;
     return (y * gridSize) + y_offset;
   }
 
   method int getI(int x, int y) {
     var int xraw, yraw;
     let xraw = (x - x_offset)/gridSize;
     let yraw = (y - y_offset)/gridSize;
     return (yraw * cellsWidth) + xraw;
   }
}

class SnakeGame {
   field Snake snake;
   field int direction;
   field int gridSize;
   field int height;
   field int width;
   field int h_offset;
   field int w_offset;
   field int score;
   field int score_row, score_column;
 
   constructor SnakeGame new(int rand) {
     let gridSize = 8;
     // board is set to be 41 blocks wide and 28 blocks tall
     let height = 28 * gridSize;
     let width = 41 * gridSize;
     let h_offset = 2 * gridSize;
     let w_offset = 6 * gridSize;
 
     let direction = 2;
     let score = 0;
     // Score location is based on the character grid of 
     // 23 rows of 64 columns
     let score_column = 50;
     let score_row = 20;
 
     // Snake is spawned in the center of the screen
     let snake = Snake.new(height, width, h_offset, w_offset, gridSize, rand);
 
     return this;
   }
 
   method void dispose() {
     do snake.dispose();
     do Memory.deAlloc(this);
     return;
   }
 
   method void run() {
     var char key;
     var boolean exit;
     var boolean grow;
     let exit = false;
     let grow = false;
 
     while (~exit) {
       // while waiting for key to be pressed, continue growing in direction
       while (key = 0) {
         // This doesn't work perfectly - really need an input buffer so that
         // rapid keystrokes are not missed
         let key = Keyboard.keyPressed();
         do snake.step(direction, grow);
       }
 
       if (key = 81) { let exit = true; } // quit on key q
       if (key = 131) { let direction = 1; } // up arrow
       if (key = 132) { let direction = 2; } // right arrow
       if (key = 133) { let direction = 3; } // down arrow
       if (key = 130) { let direction = 4; } // left arrow
       // do Output.printInt(key);
 
       // while waiting for key to be released, continue growing in (new) direction
       while (~(key=0)) {
         let key = Keyboard.keyPressed();
         do snake.step(direction, grow);
       }
     }
     return;
   }
}   
`
	}
];
