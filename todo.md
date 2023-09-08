State to manage:
- jackcode string
- bytecode string
- compiled/not compiled
- program
- running/not running
- ram cells...

Events/interactions
- compile button: sends jackcode string to compiler and loads result into bytecode string (compiler doesn't yet exist as a wasm binding, lol)
- init: initializes Program with bytecode input
- step: calls Program.step()
- run: calls setInterval(() => requestAnimationFrame(renderLoop), 0)
- stop: terminates setInterval

Keyboard -> when Running, keyboard events should go to the runtime keyboard on-down handler
Otherwise, keyboard output should go to the selected codemirror instance

~~1. check if a test program can be run using the wasm bindings~~

2. fix stuff:
    - ~~Double size of canvas~~
    - ~~Use clean sans-serif font for non-code stuff~~
    - ~~Adjust colors~~
    - ~~Get rid of reset button~~
    - ~~codemirror cursor -> green~~
    - set stepsize larger for firefox
    - ~~check safari~~
    - ~~deal with mobile with a popup~~

3. add core functionality
    - ~~Bytecode updates on edit~~
    - ~~Program is created with button click~~
    - ~~Program can be run when it is created~~
    - ~~Accept input~~
    - ~~Display memory state~~

4. add secondary functionality
    - ~~Compile jack to jack bytecode~~
    - ~~Disable control buttons if program is not readied~~
    - Gray out editors while program is running; provide some kind of hint
    - Display stack
    - Highligh stack pointer
    - Display call stack
    - Display input
    - Add dropdown for selecting programs
        - 3 or 4 buttons with presets. Descriptions in About? 
    - Warning popup for losing changes when switching programs?
    - Implement the memory display using virtualized lists

polish:
 - fix keybindings in square game
 