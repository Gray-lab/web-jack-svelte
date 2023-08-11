export const square_jack = `
// This file is part of www.nand2tetris.org
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

export const snake_jack = `

`

export const average_jack = `
// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/11/Average/Main.jack

// (Same as projects/09/Average/Main.jack)

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