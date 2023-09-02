
# web_jack

## Overview

Welcome to web_jack - a web based compiler and runtime for the Jack toy langauge from nand2tetris. Web_Jack combines a Svelte frontend with a compiler written in Python and a runtime implemented in Rust and compiled to WebAssembly (wasm). After finishing the nand2tetris book I wanted to try my hand at learning Rust and web development, and implementing a Jack virtual machine seemed like a great way to demonstrate what I learned and learn some more along the way. 

## Features

- **Svelte Frontend:** The project features a user interface built using Svelte.
- **Jack Compiler:** The Python-based compiler is capable of parsing and translating Jack source code into bytecode, ready to be executed on the virtual machine.
- **Rust Runtime:** The Rust-based runtime takes the compiled bytecode and executes it efficiently within a WebAssembly environment, ensuring optimal performance.
- **Integration:** The frontend communicates with the compiled bytecode through WebAssembly, creating a holistic system where user interactions are processed and executed.

## How to Use

1. **Clone the Repository:** Begin by cloning this repository to your local machine using the following command:

    ```
    git clone https://github.com/gray-lab/WEB-JACK-SVELTE.git
    ```

2. **Install NPM Packages:** While in the root directory, install the required npm packages:
    ```
    npm --install
    ```

3. **Build and Deploy:** The package.json file contains scripts to build and package the Rust files and build and deploy the Svelte frontend. For a local dev server run:
    ```
    npm run dev
    ```

## Contributing

I welcome contributions to enhance this project! If you have ideas, improvements, or bug fixes, feel free to create a pull request. 

## Acknowledgments

I would like to express my gratitude to the creators of the Nand2Tetris course for inspiring this project, as well as the Svelte, Python, and Rust communities for providing the tools and resources necessary to bring this idea to life. I also want to thank all the awesome people at Recurse Center who encouraged and supported me while building this project.

## License

This project is licensed under the [MIT License](LICENSE). Feel free to use, modify, and distribute the code as needed.

